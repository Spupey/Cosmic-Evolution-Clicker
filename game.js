// Основные переменные игры
const gameState = {
    energy: 0,
    energyPerSecond: 0,
    faction: null,
    currentStage: 'quantum',
    technologies: {
        quantum: [],
        atomic: [],
        molecular: [],
        cosmic: [],
        universal: []
    },
    unlockedTechs: [],
    resources: {
        matter: 0,
        lifeEssence: 0,
        consciousness: 0
    },
    generators: {
        quantum: 0,
        atomic: 0,
        molecular: 0,
        cosmic: 0,
        universal: 0
    }
};

// Технологии для каждой фракции
const technologies = {
    techno: {
        quantum: [
            { id: 't_q1', name: 'Квантовые вычисления', cost: 100, effect: { eps: 0.5 }, description: 'Увеличивает ЭПС на 0.5' },
            { id: 't_q2', name: 'Стабилизация частиц', cost: 250, effect: { clickPower: 2 }, description: 'Увеличивает силу клика в 2 раза' }
        ],
        atomic: [
            { id: 't_a1', name: 'Атомный синтез', cost: 1000, effect: { eps: 5 }, description: 'Увеличивает ЭПС на 5' },
            { id: 't_a2', name: 'Наноконструкторы', cost: 2500, effect: { autoClicker: 1 }, description: 'Автоматические клики 1/сек' }
        ]
    },
    bio: {
        quantum: [
            { id: 'b_q1', name: 'Органические связи', cost: 100, effect: { eps: 0.3, lifeEssence: 0.1 }, description: 'Увеличивает ЭПС и сущность жизни' },
            { id: 'b_q2', name: 'Клеточная эволюция', cost: 300, effect: { clickPower: 1.5 }, description: 'Увеличивает силу клика' }
        ]
    },
    psi: {
        quantum: [
            { id: 'p_q1', name: 'Пси-резонанс', cost: 120, effect: { eps: 0.4, consciousness: 0.1 }, description: 'Увеличивает ЭПС и сознание' },
            { id: 'p_q2', name: 'Телекинетический импульс', cost: 350, effect: { clickPower: 2.5 }, description: 'Сильно увеличивает силу клика' }
        ]
    }
};

// Инициализация игры
function initGame() {
    // Загрузка сохранения
    loadGame();
    
    // Настройка клик-области
    const clickTarget = document.getElementById('click-target');
    const particlesContainer = document.getElementById('particles');
    
    clickTarget.addEventListener('click', (e) => {
        handleClick(e);
        createParticles(e, particlesContainer);
    });
    
    // Настройка фракций
    document.querySelectorAll('.faction-btn').forEach(btn => {
        btn.addEventListener('click', () => selectFaction(btn.dataset.faction));
    });
    
    // Настройка стадий эволюции
    document.querySelectorAll('.track-stage').forEach(stage => {
        stage.addEventListener('click', () => {
            if (stage.classList.contains('active')) return;
            setEvolutionStage(stage.dataset.stage);
        });
    });
    
    // Запуск игрового цикла
    setInterval(gameLoop, 1000);
    
    // Случайные события
    setInterval(randomEvent, 30000);
    
    // Первоначальная отрисовка
    updateUI();
    renderTechTree();
}

// Обработка кликов
function handleClick(event) {
    let clickPower = 1;
    
    // Учет улучшений
    if (gameState.unlockedTechs.includes('t_q2')) clickPower *= 2;
    if (gameState.unlockedTechs.includes('b_q2')) clickPower *= 1.5;
    if (gameState.unlockedTechs.includes('p_q2')) clickPower *= 2.5;
    
    gameState.energy += clickPower;
    
    // Эффекты от фракций
    if (gameState.faction === 'bio') {
        gameState.resources.lifeEssence += 0.05;
    }
    if (gameState.faction === 'psi') {
        gameState.resources.consciousness += 0.05;
    }
    
    updateUI();
}

// Создание частиц при клике
function createParticles(event, container) {
    const rect = container.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    for (let i = 0; i < 15; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = `${x}px`;
        particle.style.top = `${y}px`;
        
        // Разные цвета для фракций
        if (gameState.faction === 'techno') {
            particle.style.backgroundColor = '#00a8ff';
        } else if (gameState.faction === 'bio') {
            particle.style.backgroundColor = '#00d8a0';
        } else if (gameState.faction === 'psi') {
            particle.style.backgroundColor = '#c678dd';
        }
        
        container.appendChild(particle);
        
        // Анимация движения
        const angle = Math.random() * Math.PI * 2;
        const speed = 1 + Math.random() * 3;
        const lifetime = 1000 + Math.random() * 500;
        
        const startTime = Date.now();
        
        function animate() {
            const elapsed = Date.now() - startTime;
            const progress = elapsed / lifetime;
            
            if (progress >= 1) {
                particle.remove();
                return;
            }
            
            const distance = speed * elapsed / 50;
            particle.style.transform = `translate(${Math.cos(angle) * distance}px, ${Math.sin(angle) * distance}px)`;
            particle.style.opacity = 1 - progress;
            
            requestAnimationFrame(animate);
        }
        
        requestAnimationFrame(animate);
    }
}

// Выбор фракции
function selectFaction(faction) {
    gameState.faction = faction;
    document.querySelectorAll('.faction-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`.faction-btn[data-faction="${faction}"]`).classList.add('active');
    
    // Обновление цветов в соответствии с фракцией
    document.documentElement.style.setProperty('--techno-color', 
        faction === 'techno' ? '#00a8ff' : '#006a9e');
    document.documentElement.style.setProperty('--bio-color', 
        faction === 'bio' ? '#00d8a0' : '#008a6e');
    document.documentElement.style.setProperty('--psi-color', 
        faction === 'psi' ? '#c678dd' : '#8a4d9e');
    
    renderTechTree();
    saveGame();
}

// Установка стадии эволюции
function setEvolutionStage(stage) {
    gameState.currentStage = stage;
    document.querySelectorAll('.track-stage').forEach(el => {
        el.classList.remove('active');
    });
    document.querySelector(`.track-stage[data-stage="${stage}"]`).classList.add('active');
    renderTechTree();
}

// Отрисовка древа технологий
function renderTechTree() {
    const techTree = document.getElementById('tech-tree');
    techTree.innerHTML = '';
    
    if (!gameState.faction) return;
    
    const currentTechs = technologies[gameState.faction][gameState.currentStage];
    if (!currentTechs) return;
    
    currentTechs.forEach(tech => {
        const techCard = document.createElement('div');
        techCard.className = 'tech-card';
        
        if (gameState.unlockedTechs.includes(tech.id)) {
            techCard.classList.add('unlocked');
        } else if (gameState.energy >= tech.cost) {
            techCard.classList.add('available');
            techCard.addEventListener('click', () => unlockTech(tech));
        } else {
            techCard.classList.add('locked');
        }
        
        techCard.innerHTML = `
            <h3>${tech.name}</h3>
            <p>${tech.description}</p>
            <p class="tech-cost">Стоимость: ${tech.cost} энергии</p>
        `;
        
        techTree.appendChild(techCard);
    });
}

// Разблокировка технологии
function unlockTech(tech) {
    if (gameState.energy < tech.cost || gameState.unlockedTechs.includes(tech.id)) return;
    
    gameState.energy -= tech.cost;
    gameState.unlockedTechs.push(tech.id);
    
    // Применение эффектов
    if (tech.effect.eps) {
        gameState.energyPerSecond += tech.effect.eps;
    }
    
    // Другие эффекты можно добавить здесь
    
    updateUI();
    renderTechTree();
    saveGame();
}

// Игровой цикл
function gameLoop() {
    // Пассивный доход
    gameState.energy += gameState.energyPerSecond;
    
    // Автокликеры
    if (gameState.unlockedTechs.includes('t_a2')) {
        gameState.energy += 1;
    }
    
    updateUI();
    saveGame();
}

// Случайные события
function randomEvent() {
    const events = [
        {
            name: "Квантовая флуктуация",
            description: "Обнаружены нестабильные квантовые колебания!",
            effect: () => { gameState.energy *= 1.5; }
        },
        {
            name: "Космическая буря",
            description: "Энергетические помехи снижают эффективность!",
            effect: () => { gameState.energyPerSecond *= 0.8; }
        }
    ];
    
    const randomEvent = events[Math.floor(Math.random() * events.length)];
    randomEvent.effect();
    
    logEvent(randomEvent.name, randomEvent.description);
}

// Логирование событий
function logEvent(title, description) {
    const eventLog = document.getElementById('event-log');
    const eventEntry = document.createElement('div');
    eventEntry.className = 'event-entry';
    eventEntry.innerHTML = `
        <h4>${title}</h4>
        <p>${description}</p>
        <small>${new Date().toLocaleTimeString()}</small>
    `;
    eventLog.prepend(eventEntry);
    
    // Ограничение количества записей
    if (eventLog.children.length > 20) {
        eventLog.removeChild(eventLog.lastChild);
    }
}

// Обновление интерфейса
function updateUI() {
    document.getElementById('energy-count').textContent = Math.floor(gameState.energy);
    document.getElementById('eps-count').textContent = gameState.energyPerSecond.toFixed(1);
}

// Сохранение игры
function saveGame() {
    localStorage.setItem('cosmicClickerSave', JSON.stringify(gameState));
}

// Загрузка игры
function loadGame() {
    const save = localStorage.getItem('cosmicClickerSave');
    if (save) {
        Object.assign(gameState, JSON.parse(save));
    }
    
    if (gameState.faction) {
        document.querySelector(`.faction-btn[data-faction="${gameState.faction}"]`).classList.add('active');
    }
}

// Запуск игры
document.addEventListener('DOMContentLoaded', initGame);
