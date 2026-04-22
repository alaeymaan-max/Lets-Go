/**
 * jom-mula | index.js
 * Core Engine: Database Search, Step Navigation & Rewards
 */

const JomMula = {
    // 1. State Aplikasi
    state: {
        profile: {
            age: 'remaja',
            iqLevel: 'biasa',
            mood: 'rela'
        },
        activeGuide: null,
        currentStep: 0,
        isFinished: false
    },

    // 2. Inisialisasi
    init() {
        console.log("🚀 Jom-Mula Engine: Started");
        this.loadProfile();
        this.bindEvents();
        this.renderInitialUI();
    },

    // 3. Event Listeners
    bindEvents() {
        const searchBtn = document.getElementById('search-btn');
        const searchInput = document.getElementById('search-input');
        const nextBtn = document.getElementById('next-step');
        const prevBtn = document.getElementById('prev-step');
        const profileTrigger = document.getElementById('profile-trigger');

        // Fungsi Carian
        if (searchBtn) {
            searchBtn.addEventListener('click', () => this.handleSearch(searchInput.value));
        }

        if (searchInput) {
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.handleSearch(searchInput.value);
            });
        }

        // Navigasi Langkah
        if (nextBtn) {
            nextBtn.addEventListener('click', () => this.navigate(1));
        }

        if (prevBtn) {
            prevBtn.addEventListener('click', () => this.navigate(-1));
        }

        // Modal Profil
        if (profileTrigger) {
            profileTrigger.addEventListener('click', () => this.toggleProfileModal(true));
        }
    },

    // 4. Logik Carian Database
    handleSearch(query) {
        if (!query.trim()) return;

        const searchTerm = query.toLowerCase();
        
        // Cari dalam database_soalan.js
        const match = database_soalan.find(item => 
            item.keyword.some(key => searchTerm.includes(key))
        );

        if (match) {
            // Tarik data penuh dari database_jawapan.js
            this.state.activeGuide = database_jawapan[match.id];
            this.state.currentStep = 0;
            this.state.isFinished = false;
            this.renderGuide();
            
            // Kesan visual permulaan
            if (typeof JomMulaEffects !== 'undefined') JomMulaEffects.popStandard();
        } else {
            this.renderNotFound();
        }
    },

    // 5. Navigasi Antara Langkah
    navigate(direction) {
        const guide = this.state.activeGuide;
        if (!guide) return;

        const newStep = this.state.currentStep + direction;

        if (newStep >= guide.steps.length) {
            this.finishGuide();
        } else if (newStep >= 0) {
            this.state.currentStep = newStep;
            this.renderGuide();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    },

    // 6. Penamat & Ganjaran
    finishGuide() {
        this.state.isFinished = true;
        this.renderFinishScreen();

        // Letupkan Keraian
        if (typeof JomMulaEffects !== 'undefined') JomMulaEffects.fireworks();

        // Beri Lencana berdasarkan guide
        if (typeof JomMulaBadges !== 'undefined' && this.state.activeGuide.badge_reward) {
            JomMulaBadges.awardBadge(this.state.activeGuide.badge_reward);
        }

        // Aktifkan sistem sumbangan
        setTimeout(() => {
            if (typeof JomMulaDonation !== 'undefined') {
                JomMulaDonation.init(this.state.profile);
            }
        }, 1000);
    },

    // 7. Render UI (Manipulasi DOM)
    renderGuide() {
        const contentArea = document.getElementById('content-area');
        const navControls = document.getElementById('nav-controls');
        const guide = this.state.activeGuide;
        const step = guide.steps[this.state.currentStep];
        const progress = ((this.state.currentStep + 1) / guide.steps.length) * 100;

        navControls.classList.remove('hidden');
        
        contentArea.innerHTML = `
            <div class="animate-fadeIn">
                <div class="mb-4 flex justify-between items-center text-xs font-bold text-indigo-400 uppercase tracking-widest">
                    <span>${guide.title}</span>
                    <span>Langkah ${this.state.currentStep + 1} / ${guide.steps.length}</span>
                </div>
                
                <div class="w-full h-1.5 bg-gray-100 rounded-full mb-8 overflow-hidden">
                    <div class="h-full bg-indigo-500 transition-all duration-500" style="width: ${progress}%"></div>
                </div>

                <div class="soft-card p-8 bg-white rounded-[30px] shadow-sm border-b-4 border-indigo-100">
                    <h2 class="text-2xl font-bold text-gray-800 mb-4">${step.title}</h2>
                    <p class="text-gray-600 leading-relaxed text-lg mb-8">${step.text}</p>
                    
                    ${step.motivation ? `
                        <div class="bg-indigo-50 p-6 rounded-[20px] border-l-4 border-indigo-400">
                            <p class="text-indigo-700 italic text-sm">"${step.motivation}"</p>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;

        document.getElementById('next-step').innerText = 
            this.state.currentStep === guide.steps.length - 1 ? "Selesai" : "Langkah Seterusnya";
    },

    renderFinishScreen() {
        const contentArea = document.getElementById('content-area');
        const navControls = document.getElementById('nav-controls');
        navControls.classList.add('hidden');

        contentArea.innerHTML = `
            <div class="text-center animate-fadeIn py-10">
                <div class="text-6xl mb-6">🏆</div>
                <h2 class="text-3xl font-bold text-gray-800 mb-2">Hebat, Anda Berjaya!</h2>
                <p class="text-gray-500 mb-8">Anda telah menguasai kemahiran ini. Teruskan belajar!</p>
                
                <div id="donation-section" class="mb-6"></div>
                
                <button onclick="location.reload()" class="w-full p-4 bg-gray-100 text-gray-600 rounded-2xl font-bold hover:bg-gray-200 transition-all">
                    Cari Ilmu Lain
                </button>
            </div>
        `;
    },

    renderNotFound() {
        const contentArea = document.getElementById('content-area');
        contentArea.innerHTML = `
            <div class="soft-card p-12 text-center bg-white rounded-[30px] animate-pulse">
                <div class="text-6xl mb-4">🔍</div>
                <h2 class="text-xl font-bold text-gray-800 mb-2">Maaf, tajuk belum ada.</h2>
                <p class="text-gray-500">Cuba cari kata kunci lain seperti 'masa' atau 'disiplin'.</p>
            </div>
        `;
    },

    renderInitialUI() {
        // Paparan asal semasa mula-mula buka app
        console.log("UI Ready for Search");
    },

    // 8. Pengurusan Profil & Storage
    loadProfile() {
        const saved = localStorage.getItem('jomMula_user');
        if (saved) this.state.profile = JSON.parse(saved);
    },

    toggleProfileModal(show) {
        const modal = document.getElementById('config-modal');
        if (show) {
            modal.classList.remove('hidden');
            modal.classList.add('flex');
        } else {
            modal.classList.add('hidden');
            modal.classList.remove('flex');
        }
    }
};

// Start the App
document.addEventListener('DOMContentLoaded', () => JomMula.init());
