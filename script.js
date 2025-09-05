// Data de início do relacionamento: 08/12/2021 às 21:55
const startDate = new Date(2021, 11, 8, 21, 55, 0); // Ano, mês (0-11), dia, hora, minuto, segundo

// Função para atualizar o contador
function updateCounter() {
  const now = new Date();
  const diff = now - startDate;

  // Converter diferença em milissegundos para diferentes unidades
  const totalSeconds = Math.floor(diff / 1000);
  const totalMinutes = Math.floor(totalSeconds / 60);
  const totalHours = Math.floor(totalMinutes / 60);
  const totalDays = Math.floor(totalHours / 24);

  // Calcular anos, meses e dias restantes
  let years = now.getFullYear() - startDate.getFullYear();
  let months = now.getMonth() - startDate.getMonth();
  let days = now.getDate() - startDate.getDate();

  // Ajustar se o dia atual for menor que o dia de início
  if (days < 0) {
    months--;
    const lastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    days += lastMonth.getDate();
  }

  // Ajustar se o mês atual for menor que o mês de início
  if (months < 0) {
    years--;
    months += 12;
  }

  // Calcular horas, minutos e segundos restantes
  const hours = now.getHours() - startDate.getHours();
  const minutes = now.getMinutes() - startDate.getMinutes();
  const seconds = now.getSeconds() - startDate.getSeconds();

  // Ajustar valores negativos
  let finalHours = hours < 0 ? hours + 24 : hours;
  let finalMinutes = minutes < 0 ? minutes + 60 : minutes;
  let finalSeconds = seconds < 0 ? seconds + 60 : seconds;

  // Atualizar elementos na tela
  document.getElementById("years").textContent = years;
  document.getElementById("months").textContent = months;
  document.getElementById("days").textContent = days;
  document.getElementById("hours").textContent = finalHours;
  document.getElementById("minutes").textContent = finalMinutes;
  document.getElementById("seconds").textContent = finalSeconds;
}

// Carousel
let currentSlideIndex = 0;
const slides = document.querySelectorAll(".carousel-slide");
const dots = document.querySelectorAll(".dot");

function showSlide(index) {
  slides.forEach((slide, i) => {
    slide.classList.toggle("active", i === index);
  });
  dots.forEach((dot, i) => {
    dot.classList.toggle("active", i === index);
  });
}

function currentSlide(index) {
  currentSlideIndex = index;
  showSlide(index);
}

function nextSlide() {
  currentSlideIndex = (currentSlideIndex + 1) % slides.length;
  showSlide(currentSlideIndex);
}

// Auto slide
setInterval(nextSlide, 4000);

// Music player
let isPlaying = false;
const audio = document.getElementById("audio");
const playIcon = document.getElementById("play-icon");

function toggleMusic() {
  if (isPlaying) {
    audio.pause();
    playIcon.textContent = "▶️";
    isPlaying = false;
  } else {
    // Como não há arquivo de áudio, vamos simular
    playIcon.textContent = "⏸️";
    isPlaying = true;
    audio.play();

    // Simular pausa após alguns segundos para demonstração
    setTimeout(() => {
      if (isPlaying) {
        playIcon.textContent = "▶️";
        isPlaying = false;
      }
    }, 3000);
  }
}

// Inicializar contador e atualizar a cada segundo
updateCounter();
setInterval(updateCounter, 1000);
