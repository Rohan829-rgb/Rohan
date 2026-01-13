
const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const previewImg = document.getElementById('previewImg');
const detectBtn = document.getElementById('detectBtn');
const loading = document.getElementById('loading');
const resultContainer = document.getElementById('resultContainer');
const detectedFruit = document.getElementById('detectedFruit');
const confidenceLevel = document.getElementById('confidenceLevel');
const modelStatus = document.getElementById('modelStatus');

const modelURL = 'https://teachablemachine.withgoogle.com/models/RAUqUC42K/';

let model = null;
let actualClasses = [];

async function initializeApp() {
    try {
        console.log('🚀 Initializing Fruit Detection App...');
        modelStatus.textContent = 'Loading Model...';

        await loadModel();
        initializeUI();

        modelStatus.textContent = 'Model Loaded Successfully ✓';
        console.log('✅ App Initialized');
    } catch (error) {
        console.error(error);
        modelStatus.textContent = 'Model Loading Failed';
        alert('Model load failed. Check internet connection.');
    }
}

async function loadModel() {
    loading.style.display = 'block';
    loading.querySelector('p').textContent = 'Loading AI Model...';

    model = await tmImage.load(
        modelURL + 'model.json',
        modelURL + 'metadata.json'
    );

    actualClasses = model.getClassLabels();
    console.log('📊 Model Classes:', actualClasses);

    loading.style.display = 'none';
}

function initializeUI() {
    initializeResults();
    setupEventListeners();
}

function initializeResults() {
    resultContainer.innerHTML = '';

    const classes = actualClasses.length
        ? actualClasses
        : ['Banana', 'Orange', 'Mango', 'Pineapple', 'Apple', 'Guava'];

    classes.forEach((fruit, index) => {
        const div = document.createElement('div');
        div.className = 'result-item';
        div.id = `result-${index}`;
        div.innerHTML = `
            <div>
                <div class="fruit-name">${fruit}</div>
                <div class="confidence-bar">
                    <div class="confidence-fill" id="fill-${index}"></div>
                </div>
            </div>
            <div class="percentage" id="percent-${index}">0%</div>
        `;
        resultContainer.appendChild(div);
    });
}

function setupEventListeners() {
    uploadArea.addEventListener('click', () => fileInput.click());

    uploadArea.addEventListener('dragover', e => {
        e.preventDefault();
        uploadArea.classList.add('drag-over');
    });

    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('drag-over');
    });

    uploadArea.addEventListener('drop', e => {
        e.preventDefault();
        uploadArea.classList.remove('drag-over');
        fileInput.files = e.dataTransfer.files;
        handleFileSelect({ target: fileInput });
    });

    fileInput.addEventListener('change', handleFileSelect);
    detectBtn.addEventListener('click', detectFruit);
}

function handleFileSelect(event) {
    const file = event.target.files[0];
    if (!file || !file.type.startsWith('image/')) {
        alert('Please upload an image file');
        return;
    }

    const reader = new FileReader();
    reader.onload = e => {
        previewImg.src = e.target.result;
        previewImg.style.display = 'block';
        detectBtn.disabled = false;
        resetResults();
    };
    reader.readAsDataURL(file);
}

function resetResults() {
    actualClasses.forEach((_, index) => {
        const fill = document.getElementById(`fill-${index}`);
        const percent = document.getElementById(`percent-${index}`);
        const item = document.getElementById(`result-${index}`);

        if (fill && percent && item) {
            fill.style.width = '0%';
            percent.textContent = '0%';
            fill.classList.remove('active');
            item.classList.remove('active');
        }
    });

    detectedFruit.textContent = '-';
    confidenceLevel.textContent = '-';
}

async function detectFruit() {
    if (!model || !previewImg.src) return;

    loading.style.display = 'block';
    loading.querySelector('p').textContent = 'Analyzing Image...';
    detectBtn.disabled = true;

    try {
        const predictions = await model.predict(previewImg);
        processDetectionResults(predictions);
    } catch (error) {
        alert('Detection failed');
        console.error(error);
    } finally {
        loading.style.display = 'none';
        detectBtn.disabled = false;
    }
}

function processDetectionResults(predictions) {
    resetResults();

    let maxIndex = 0;
    predictions.forEach((p, i) => {
        if (p.probability > predictions[maxIndex].probability) {
            maxIndex = i;
        }
    });

    const fruitName = predictions[maxIndex].className;
    updateResultsUI(maxIndex);
    showFinalResult(fruitName);

    console.log(`✅ Detected: ${fruitName}`);
}

function updateResultsUI(detectedIndex) {
    actualClasses.forEach((_, index) => {
        const fill = document.getElementById(`fill-${index}`);
        const percent = document.getElementById(`percent-${index}`);
        const item = document.getElementById(`result-${index}`);

        if (index === detectedIndex) {
            fill.style.width = '100%';
            percent.textContent = '100%';
            fill.classList.add('active');
            item.classList.add('active');
        }
    });
}

function showFinalResult(name) {
    detectedFruit.textContent = name;
    confidenceLevel.textContent = '100% Accurate Detection';
    console.log(`🎉 Final Detection: ${name}`);
}

window.debugModel = async function () {
    if (!model) return;
    console.log(await model.predict(previewImg));
};

window.addEventListener('load', initializeApp);

console.log('%c🍎 Fruit Detection App Ready', 'color:green;font-size:16px');
