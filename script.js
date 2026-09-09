const ADMIN_WA = '6285782023998';

const body = document.body;
const welcomeScreen = document.getElementById('welcomeScreen');
const openingScreen = document.getElementById('openingScreen');
const registrationScreen = document.getElementById('registrationScreen');
const storyTrack = document.getElementById('storyTrack');
const storyViewport = document.getElementById('storyViewport');
const slides = [...document.querySelectorAll('.story-slide')];
const progressItems = [...document.querySelectorAll('.progress-item')];
const prevSlide = document.getElementById('prevSlide');
const nextSlide = document.getElementById('nextSlide');
const skipOpening = document.getElementById('skipOpening');
const startRegistration = document.getElementById('startRegistration');
const currentNumber = document.getElementById('currentNumber');
const backToOpening = document.getElementById('backToOpening');
const brandHome = document.getElementById('brandHome');

const form = document.getElementById('formRohis');
const alasan = document.getElementById('alasan');
const count = document.getElementById('count');
const submitButton = document.getElementById('submitButton');
const formPercent = document.getElementById('formPercent');
const formProgressBar = document.getElementById('formProgressBar');

let current = 0;
let touchStartX = 0;
let touchStartY = 0;
let autoSlideTimer = null;
const AUTO_SLIDE_DELAY = 8000;

function pad(value){ return String(value).padStart(2,'0'); }

function showOpening(){
  openingScreen.classList.add('is-visible');
  openingScreen.setAttribute('aria-hidden','false');
  registrationScreen.classList.remove('is-visible');
  registrationScreen.setAttribute('aria-hidden','true');
  body.classList.add('opening-mode');
  updateStory(false);
  restartAutoSlide();
}

function leaveWelcome(){
  showOpening();
  requestAnimationFrame(() => welcomeScreen.classList.add('is-leaving'));
  window.setTimeout(() => { welcomeScreen.style.display = 'none'; }, 1000);
}

function clearAutoSlide(){
  if(autoSlideTimer){
    clearTimeout(autoSlideTimer);
    autoSlideTimer = null;
  }
}

function restartAutoSlide(){
  clearAutoSlide();
  if(!openingScreen.classList.contains('is-visible')) return;
  if(lightbox.classList.contains('is-open')) return;
  if(current >= slides.length - 1) return;
  autoSlideTimer = setTimeout(() => {
    if(current < slides.length - 1){
      current += 1;
      updateStory(true);
      restartAutoSlide();
    }
  }, AUTO_SLIDE_DELAY);
}

function updateStory(animate = true){
  if(!animate) storyTrack.style.transition = 'none';
  storyTrack.style.transform = `translate3d(-${current * 100}%,0,0)`;
  slides.forEach((slide,index) => slide.classList.toggle('is-current',index === current));
  progressItems.forEach((item,index) => {
    item.classList.toggle('is-active',index === current);
    item.classList.toggle('is-complete',index < current);
  });
  currentNumber.textContent = pad(current + 1);
  prevSlide.disabled = current === 0;
  nextSlide.setAttribute('aria-label', current === slides.length - 1 ? 'Masuk ke formulir' : 'Slide berikutnya');
  slides[current]?.querySelector('.slide-scroll')?.scrollTo({top:0,behavior:'auto'});
  if(!animate) requestAnimationFrame(() => requestAnimationFrame(() => { storyTrack.style.transition = ''; }));
}

function goTo(index){
  current = Math.max(0,Math.min(slides.length - 1,index));
  updateStory(true);
  restartAutoSlide();
}

function openForm(){
  clearAutoSlide();
  openingScreen.classList.remove('is-visible');
  openingScreen.setAttribute('aria-hidden','true');
  registrationScreen.classList.add('is-visible');
  registrationScreen.setAttribute('aria-hidden','false');
  body.classList.remove('opening-mode');
  window.scrollTo({top:0,behavior:'auto'});
  setTimeout(() => document.getElementById('nama')?.focus({preventScroll:true}),250);
}

function returnToOpening(){
  registrationScreen.classList.remove('is-visible');
  registrationScreen.setAttribute('aria-hidden','true');
  openingScreen.classList.add('is-visible');
  openingScreen.setAttribute('aria-hidden','false');
  body.classList.add('opening-mode');
  window.scrollTo({top:0,behavior:'auto'});
  restartAutoSlide();
}

nextSlide.addEventListener('click',() => current === slides.length - 1 ? openForm() : goTo(current + 1));
prevSlide.addEventListener('click',() => goTo(current - 1));
progressItems.forEach((item,index) => item.addEventListener('click',() => goTo(index)));
skipOpening.addEventListener('click',openForm);
startRegistration.addEventListener('click',openForm);
backToOpening.addEventListener('click',returnToOpening);
brandHome.addEventListener('click',() => goTo(0));

storyViewport.addEventListener('touchstart',(event) => {
  clearAutoSlide();
  if(event.touches.length !== 1) return;
  touchStartX = event.touches[0].clientX;
  touchStartY = event.touches[0].clientY;
},{passive:true});

storyViewport.addEventListener('touchend',(event) => {
  if(!event.changedTouches[0]) return;
  const dx = event.changedTouches[0].clientX - touchStartX;
  const dy = event.changedTouches[0].clientY - touchStartY;
  if(Math.abs(dx) > 62 && Math.abs(dx) > Math.abs(dy) * 1.3){
    if(dx < 0){ current === slides.length - 1 ? openForm() : goTo(current + 1); }
    else if(current > 0) goTo(current - 1);
  }else{
    restartAutoSlide();
  }
},{passive:true});

storyViewport.addEventListener('wheel',restartAutoSlide,{passive:true});

document.addEventListener('keydown',(event) => {
  if(lightbox.classList.contains('is-open')) return;
  if(!openingScreen.classList.contains('is-visible')) return;
  if(event.key === 'ArrowRight') current === slides.length - 1 ? openForm() : goTo(current + 1);
  if(event.key === 'ArrowLeft' && current > 0) goTo(current - 1);
});

/* LIGHTBOX */
const lightbox = document.getElementById('lightbox');
const lightboxImage = document.getElementById('lightboxImage');
const lightboxCaption = document.getElementById('lightboxCaption');
const lightboxClose = document.getElementById('lightboxClose');
const lightboxPrev = document.getElementById('lightboxPrev');
const lightboxNext = document.getElementById('lightboxNext');
const photoButtons = [...document.querySelectorAll('.photo-open')];
const uniquePhotos = [];
photoButtons.forEach(button => {
  const src = button.dataset.photo;
  const caption = button.dataset.caption || button.querySelector('img')?.alt || '';
  if(src && !uniquePhotos.some(photo => photo.src === src)) uniquePhotos.push({src,caption});
});
let lightboxIndex = 0;

function openLightbox(src,caption){
  const found = uniquePhotos.findIndex(photo => photo.src === src);
  lightboxIndex = found >= 0 ? found : 0;
  lightboxImage.src = src;
  lightboxImage.alt = caption || 'Foto Rohis';
  lightboxCaption.textContent = caption || '';
  lightbox.classList.add('is-open');
  lightbox.setAttribute('aria-hidden','false');
  document.body.style.overflow = 'hidden';
}
function closeLightbox(){
  lightbox.classList.remove('is-open');
  lightbox.setAttribute('aria-hidden','true');
  lightboxImage.src = '';
  document.body.style.overflow = body.classList.contains('opening-mode') ? 'hidden' : '';
}
function showLightboxPhoto(index){
  lightboxIndex = (index + uniquePhotos.length) % uniquePhotos.length;
  const photo = uniquePhotos[lightboxIndex];
  lightboxImage.src = photo.src;
  lightboxImage.alt = photo.caption || 'Foto Rohis';
  lightboxCaption.textContent = photo.caption || '';
}
photoButtons.forEach(button => button.addEventListener('click',() => { clearAutoSlide(); openLightbox(button.dataset.photo,button.dataset.caption); }));
lightboxClose.addEventListener('click',() => { closeLightbox(); restartAutoSlide(); });
lightboxPrev.addEventListener('click',() => showLightboxPhoto(lightboxIndex - 1));
lightboxNext.addEventListener('click',() => showLightboxPhoto(lightboxIndex + 1));
lightbox.addEventListener('click',(event) => { if(event.target === lightbox){ closeLightbox(); restartAutoSlide(); } });
document.addEventListener('keydown',(event) => {
  if(!lightbox.classList.contains('is-open')) return;
  if(event.key === 'Escape'){ closeLightbox(); restartAutoSlide(); }
  if(event.key === 'ArrowLeft') showLightboxPhoto(lightboxIndex - 1);
  if(event.key === 'ArrowRight') showLightboxPhoto(lightboxIndex + 1);
});

/* FORM */
function setError(el,message){
  const field = el.closest('.field');
  if(!field) return;
  field.classList.toggle('invalid',Boolean(message));
  const error = field.querySelector('.error');
  if(error) error.textContent = message || '';
}

function updateFormProgress(){
  const nama = document.getElementById('nama')?.value.trim();
  const kelas = document.getElementById('kelas')?.value;
  const jurusan = document.getElementById('jurusan')?.value;
  const nohp = document.getElementById('nohp')?.value.trim();
  const gender = document.querySelector('input[name="gender"]:checked');
  const alasanValue = alasan?.value.trim();
  const completed = [nama,kelas,jurusan,nohp,gender,alasanValue].filter(Boolean).length;
  const percent = Math.round((completed / 6) * 100);
  if(formPercent) formPercent.textContent = `${percent}%`;
  if(formProgressBar) formProgressBar.style.width = `${percent}%`;
}

function validate(){
  const nama = document.getElementById('nama');
  const kelas = document.getElementById('kelas');
  const jurusan = document.getElementById('jurusan');
  const nohp = document.getElementById('nohp');
  const gender = document.querySelector('input[name="gender"]:checked');
  let valid = true;

  if(!nama.value.trim()){setError(nama,'Nama wajib diisi.');valid=false}else setError(nama,'');
  if(!kelas.value){setError(kelas,'Pilih kelas.');valid=false}else setError(kelas,'');
  if(!jurusan.value){setError(jurusan,'Pilih jurusan.');valid=false}else setError(jurusan,'');

  const phone = nohp.value.replace(/[^\d+]/g,'');
  if(!nohp.value.trim()){setError(nohp,'Nomor HP wajib diisi.');valid=false}
  else if(!/^(\+62|62|0)8[1-9][0-9]{6,11}$/.test(phone)){setError(nohp,'Masukkan nomor HP yang valid.');valid=false}
  else setError(nohp,'');

  const genderError = document.getElementById('genderError');
  if(!gender){genderError.textContent='Pilih gender.';valid=false}else genderError.textContent='';

  if(!alasan.value.trim()){setError(alasan,'Alasan, minat, dan tujuan wajib diisi.');valid=false}
  else if(alasan.value.trim().length < 10){setError(alasan,'Tulis sedikit lebih lengkap.');valid=false}
  else setError(alasan,'');
  return valid;
}

alasan.addEventListener('input',() => { count.textContent = alasan.value.length; if(alasan.value.trim().length >= 10) setError(alasan,''); updateFormProgress(); });
document.querySelectorAll('input,select,textarea').forEach(el => {
  const clear = () => {
    if(el.value && el.closest('.field')) setError(el,'');
    updateFormProgress();
  };
  el.addEventListener('input',clear);
  el.addEventListener('change',clear);
});
document.querySelectorAll('input[name="gender"]').forEach(el => el.addEventListener('change',() => {
  document.getElementById('genderError').textContent='';
  updateFormProgress();
}));

form.addEventListener('submit',(event) => {
  event.preventDefault();
  if(!validate()){
    const first = form.querySelector('.invalid input,.invalid select,.invalid textarea');
    if(first) first.focus();
    return;
  }

  const nama = document.getElementById('nama').value.trim();
  const kelas = document.getElementById('kelas').value;
  const jurusan = document.getElementById('jurusan').value;
  const nohp = document.getElementById('nohp').value.trim();
  const gender = document.querySelector('input[name="gender"]:checked').value;
  const alasanText = alasan.value.trim();

  const message = `*PENDAFTARAN EKSTRAKURIKULER ROHIS*\nSMK Pustek Serpong\n\n*Nama:* ${nama}\n*Kelas:* ${kelas}\n*Jurusan:* ${jurusan}\n*No. HP / WhatsApp:* ${nohp}\n*Gender:* ${gender}\n\n*Alasan, Minat & Tujuan:*\n${alasanText}\n\n_Pendaftaran dikirim melalui Web Rohis SMK Pustek Serpong._`;

  submitButton.disabled = true;
  submitButton.querySelector('span:first-child').textContent = 'Membuka WhatsApp...';
  const url = `https://wa.me/${ADMIN_WA}?text=${encodeURIComponent(message)}`;
  setTimeout(() => { window.location.href = url; },120);
  setTimeout(() => {
    submitButton.disabled = false;
    submitButton.querySelector('span:first-child').textContent = 'Kirim ke WhatsApp';
  },1800);
});

updateFormProgress();

/* preview helper: ?nosplash=1&slide=2 */
const params = new URLSearchParams(location.search);
const requestedSlide = Number(params.get('slide'));
if(Number.isFinite(requestedSlide) && requestedSlide >= 0 && requestedSlide < slides.length) current = requestedSlide;

if(params.get('form') === '1'){
  welcomeScreen.style.display = 'none';
  openForm();
}else if(params.get('nosplash') === '1'){
  welcomeScreen.style.display = 'none';
  showOpening();
}else{
  setTimeout(leaveWelcome,2400);
}

document.addEventListener('visibilitychange',() => {
  if(document.hidden) clearAutoSlide();
  else if(openingScreen.classList.contains('is-visible') && !lightbox.classList.contains('is-open')) restartAutoSlide();
});
