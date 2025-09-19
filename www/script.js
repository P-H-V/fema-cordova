/**
 * FEMA Period Tracker - Complete Application Logic
 * Secure, encrypted menstrual cycle tracking with comprehensive features
 */

// Define httpClient directly in this file to avoid module issues
const httpClient = {
    defaultHeaders: {
        'Cache-Control': 'no-cache, no-store, must-revalidate, private',
        'Pragma': 'no-cache',
        'Expires': '0'
    },

    async get(url, options = {}) {
        // Add cache-busting parameters
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(2, 15);
        const cacheBustedUrl = `${url}${url.includes('?') ? '&' : '?'}_=${timestamp}&r=${random}&v=${Math.random()}&t=${new Date().getTime()}&nonce=${Math.floor(Math.random() * 1000000)}`;

        // Merge headers
        const headers = {
            ...this.defaultHeaders,
            ...(options.headers || {})
        };

        // Default options
        const fetchOptions = {
            method: 'GET',
            cache: 'no-store',
            headers,
            ...options
        };

        return await fetch(cacheBustedUrl, fetchOptions);
    },

    async getJSON(url, options = {}) {
        const response = await this.get(url, options);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    },

    async getText(url, options = {}) {
        const response = await this.get(url, options);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.text();
    }
};

class FemaPeriodTracker {
    constructor() {
        console.log('FEMA Period Tracker initialized');
        this.currentUser = null;
        this.currentPassword = null;
        this.KEY_SALT = 'fema-v1-salt-7e2b3c';
        // Start on current clock month
        this.currentDate = new Date();
        this.selectedDate = null;
        this.currentView = 'calendar';
        this.currentYear = this.currentDate.getFullYear();
        
        // Data storage
        this.periodData = {};
        this.notesData = {};
        this.sexData = {};
        this.gynecologistData = {};
        this.pregnancyData = {};
        this.moodData = {};
        
        // RSS and products
        this.rssItems = [];
        this.productItems = [];
        this.recommendedProductItems = [];
        this.rssRenderedCount = 0;
        this.productsMasonryInstance = null;
        
        // Pregnancy reminders by month
        this.pregnancyReminders = {
            1: "First prenatal visit scheduled. Take folic acid supplements.",
            2: "Morning sickness may begin. Stay hydrated and eat small meals.",
            3: "First trimester screening available. Consider genetic testing.",
            4: "Anatomy scan scheduled. Baby's organs are developing.",
            5: "You may feel baby's first movements. Anatomy scan time.",
            6: "Glucose screening test. Monitor weight gain.",
            7: "Third trimester begins. Baby shower planning time.",
            8: "Braxton Hicks contractions may start. Prepare birth plan.",
            9: "Full term approaching. Hospital bag should be ready."
        };
        // Additional suggestions rotated with reminders
        this.pregnancyExtraHints = [
            "Practice pelvic floor exercises.",
            "Aim for balanced meals with iron and calcium.",
            "Stay active with light exercise as approved.",
            "Track fetal movements daily.",
            "Hydrate well and rest when needed.",
            "Prepare questions for your next appointment."
        ];
        
        // Educational articles
        this.articles = [
            {
                id: 1,
                title: "Understanding Your Menstrual Cycle",
                thumbnail: "🔬",
                summary: "Learn about the phases of your menstrual cycle and what's normal.",
                content: `
                    <h1>Understanding Your Menstrual Cycle</h1>
                    <p>Your menstrual cycle is a complex process that prepares your body for potential pregnancy each month. Understanding these changes can help you track your health and plan accordingly.</p>
                    
                    <h2>The Four Phases</h2>
                    <p><strong>Menstruation (Days 1-5):</strong> The lining of your uterus (endometrium) sheds, resulting in menstrual bleeding. This typically lasts 3-7 days.</p>
                    <p><strong>Follicular Phase (Days 1-13):</strong> Your body prepares to release an egg. Estrogen levels rise, and the uterine lining begins to thicken.</p>
                    <p><strong>Ovulation (Around Day 14):</strong> A mature egg is released from the ovary. This is when you're most fertile.</p>
                    <p><strong>Luteal Phase (Days 15-28):</strong> If the egg isn't fertilized, hormone levels drop, leading to the next menstrual period.</p>
                    
                    <h2>What's Normal?</h2>
                    <ul>
                        <li>Cycle length: 21-35 days (average 28 days)</li>
                        <li>Period duration: 3-7 days</li>
                        <li>Flow volume: 30-40ml total</li>
                        <li>Some cramping and mood changes</li>
                    </ul>
                    
                    <p><strong>Remember:</strong> Every person's cycle is unique. Tracking helps you understand your personal patterns.</p>
                `
            },
            {
                id: 2,
                title: "Period Pain Management",
                thumbnail: "💆‍♀️",
                summary: "Natural and medical ways to manage menstrual cramps and discomfort.",
                content: `
                    <h1>Period Pain Management</h1>
                    <p>Menstrual cramps affect up to 90% of people who menstruate. Here are evidence-based strategies to help manage discomfort.</p>
                    
                    <h2>Natural Remedies</h2>
                    <ul>
                        <li><strong>Heat therapy:</strong> Use a heating pad or hot water bottle on your lower abdomen</li>
                        <li><strong>Exercise:</strong> Light activities like walking, yoga, or swimming can reduce cramps</li>
                        <li><strong>Hydration:</strong> Drink plenty of water to reduce bloating</li>
                        <li><strong>Massage:</strong> Gentle abdominal massage can improve circulation</li>
                        <li><strong>Rest:</strong> Ensure adequate sleep and stress management</li>
                    </ul>
                    
                    <h2>Medical Options</h2>
                    <ul>
                        <li><strong>NSAIDs:</strong> Ibuprofen or naproxen can reduce inflammation and pain</li>
                        <li><strong>Hormonal contraceptives:</strong> Can reduce period pain and flow</li>
                        <li><strong>Prescription medications:</strong> For severe cases, consult your doctor</li>
                    </ul>
                    
                    <h2>When to See a Doctor</h2>
                    <p>Seek medical attention if you experience severe pain that interferes with daily activities, sudden changes in your cycle, or if over-the-counter pain relievers don't help.</p>
                `
            },
            {
                id: 3,
                title: "Nutrition During Your Cycle",
                thumbnail: "🥗",
                summary: "How to eat well throughout your menstrual cycle for optimal health.",
                content: `
                    <h1>Nutrition During Your Cycle</h1>
                    <p>Your nutritional needs change throughout your menstrual cycle. Eating strategically can help manage symptoms and support your overall health.</p>
                    
                    <h2>During Menstruation</h2>
                    <ul>
                        <li><strong>Iron-rich foods:</strong> Spinach, lean red meat, legumes, quinoa</li>
                        <li><strong>Vitamin C:</strong> Citrus fruits, berries, bell peppers (enhances iron absorption)</li>
                        <li><strong>Magnesium:</strong> Dark chocolate, nuts, seeds (helps with cramps)</li>
                        <li><strong>Complex carbs:</strong> Oats, brown rice, sweet potatoes (stable energy)</li>
                    </ul>
                    
                    <h2>Throughout Your Cycle</h2>
                    <ul>
                        <li><strong>Calcium:</strong> Dairy, leafy greens, almonds (reduces PMS symptoms)</li>
                        <li><strong>Omega-3 fatty acids:</strong> Salmon, walnuts, chia seeds (reduces inflammation)</li>
                        <li><strong>B vitamins:</strong> Whole grains, eggs, leafy greens (supports energy)</li>
                        <li><strong>Hydration:</strong> 8-10 glasses of water daily</li>
                    </ul>
                    
                    <h2>Foods to Limit</h2>
                    <ul>
                        <li>Excessive caffeine (can worsen cramps and mood swings)</li>
                        <li>High sodium foods (increases bloating)</li>
                        <li>Refined sugars (causes energy spikes and crashes)</li>
                        <li>Alcohol (can disrupt hormone balance)</li>
                    </ul>
                `
            },
            {
                id: 4,
                title: "When to See a Doctor",
                thumbnail: "👩‍⚕️",
                summary: "Warning signs that indicate you should consult a healthcare provider.",
                content: `
                    <h1>When to See a Doctor</h1>
                    <p>While menstrual variations are normal, certain symptoms warrant medical attention. Here's when to consult a healthcare provider.</p>
                    
                    <h2>Immediate Medical Attention</h2>
                    <ul>
                        <li>Severe pain that prevents normal activities</li>
                        <li>Heavy bleeding (soaking a pad or tampon every hour for several hours)</li>
                        <li>Bleeding for more than 7 days</li>
                        <li>Fever with menstrual symptoms</li>
                        <li>Sudden, severe pelvic pain</li>
                    </ul>
                    
                    <h2>Schedule an Appointment If You Experience</h2>
                    <ul>
                        <li>Irregular cycles (shorter than 21 days or longer than 35 days)</li>
                        <li>Missed periods (if not pregnant)</li>
                        <li>Sudden changes in your normal cycle pattern</li>
                        <li>Painful periods that worsen over time</li>
                        <li>Bleeding between periods</li>
                        <li>Periods that suddenly stop before age 45</li>
                    </ul>
                    
                    <h2>Annual Gynecological Checkups</h2>
                    <p>Even if you don't have concerning symptoms, regular checkups are important for:</p>
                    <ul>
                        <li>Pap smears (every 3 years starting at age 21)</li>
                        <li>STI screening</li>
                        <li>Contraception counseling</li>
                        <li>General reproductive health assessment</li>
                    </ul>
                    
                    <p><strong>Remember:</strong> You know your body best. If something feels wrong, don't hesitate to seek medical advice.</p>
                `
            }
        ];
        
        this.init();
    }
    
    /**
     * Initialize the application
     */
    async init() {
        this.setupEventListeners();
        await this.checkAuthentication();
        this.updateCalendar();
    }
    
    /**
     * Set up all event listeners
     */
    setupEventListeners() {
        document.getElementById('toggleDarkMode').addEventListener('click', this.toggleDarkMode.bind(this));
        document.getElementById('logoutButton').addEventListener('click', this.logout.bind(this));
    }
    
    /**
     * Check if the user is authenticated
     */
    async checkAuthentication() {
        try {
            const user = await auth.currentUser;
            if (!user) {
                this.logout();
            }
        } catch (error) {
            console.error('Error checking authentication:', error);
            this.logout();
        }
    }
    
    /**
     * Update the calendar view
     */
    updateCalendar() {
        const calendarContainer = document.getElementById('calendarContainer');
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        const calendar = new Calendar(currentMonth, currentYear);
        calendarContainer.innerHTML = calendar.render();
    }
    
    /**
     * Log out the user
     */
    logout() {
        auth.signOut().then(() => {
            window.location.href = 'login.html';
        }).catch((error) => {
            console.error('Error signing out:', error);
        });
    }
    
    /**
     * Toggle dark mode
     */
    toggleDarkMode() {
        document.body.classList.toggle('dark-mode');
    }
    
    /**
     * Hide the loading overlay
     */
    hideLoadingOverlay() {
        const loadingOverlay = document.getElementById('loadingOverlay');
        if (loadingOverlay) {
            loadingOverlay.style.display = 'none';
        }
    }
    
    /**
     * Set up all event listeners
     */
    setupEventListeners() {
        console.log('Setting up event listeners...');
        // Login form
        const loginForm = document.getElementById('loginForm');
        console.log('Login form element:', loginForm);
        if (loginForm) {
            console.log('Adding login form event listener');
            loginForm.addEventListener('submit', (e) => {
                console.log('Login form submitted!');
                this.handleLogin(e);
            });
        } else {
            console.error('Login form not found!');
        }
        
        // Navigation
        this.setupNavigationListeners();
        
        // Calendar navigation
        this.setupCalendarNavigation();
        
        // Year view navigation
        this.setupYearNavigation();
        
        // Modal event listeners
        this.setupModalListeners();
        
        // Export functionality
        const exportBtn = document.getElementById('exportDataBtn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.showExportModal());
        }
        
        // Export modal listeners
        this.setupExportModalListeners();
        
        // Login delete all data link
        const loginDeleteAllData = document.getElementById('loginDeleteAllData');
        if (loginDeleteAllData) {
            loginDeleteAllData.addEventListener('click', () => this.confirmDeleteAllData());
        }

        const loadMoreBtn = document.getElementById('loadMoreArticles');
        if (loadMoreBtn) {
            loadMoreBtn.addEventListener('click', () => this.loadMoreArticles());
        }
    }
    
    setupCalendarNavigation() {
        const prevMonth = document.getElementById('prevMonth');
        const nextMonth = document.getElementById('nextMonth');
        const prevMonthLabel = document.getElementById('prevMonthLabel');
        const nextMonthLabel = document.getElementById('nextMonthLabel');
        const prevCalendarEl = document.getElementById('prevCalendar');
        const nextCalendarEl = document.getElementById('nextCalendar');
        const prevMonthHeader = document.getElementById('prevMonthHeader');
        const nextMonthHeader = document.getElementById('nextMonthHeader');
        
        // Month navigation buttons above central calendar
        const prevMonthBtn = document.getElementById('prevMonthBtn');
        const nextMonthBtn = document.getElementById('nextMonthBtn');
        
        if (prevMonth) prevMonth.addEventListener('click', () => this.navigateMonth(-1));
        if (nextMonth) nextMonth.addEventListener('click', () => this.navigateMonth(1));
        if (prevMonthLabel) prevMonthLabel.addEventListener('click', () => this.navigateMonth(-1));
        if (nextMonthLabel) nextMonthLabel.addEventListener('click', () => this.navigateMonth(1));
        
        // New month navigation buttons
        if (prevMonthBtn) prevMonthBtn.addEventListener('click', () => this.navigateMonth(-1));
        if (nextMonthBtn) nextMonthBtn.addEventListener('click', () => this.navigateMonth(1));

        // Side calendars clickable navigation
        if (prevCalendarEl) prevCalendarEl.addEventListener('click', () => this.navigateMonth(-1));
        if (nextCalendarEl) nextCalendarEl.addEventListener('click', () => this.navigateMonth(1));
        if (prevMonthHeader) prevMonthHeader.addEventListener('click', () => this.navigateMonth(-1));
        if (nextMonthHeader) nextMonthHeader.addEventListener('click', () => this.navigateMonth(1));
        
        // Year display click to open year view
        const calendarYearDisplay = document.getElementById('calendarYearDisplay');
        if (calendarYearDisplay) {
            calendarYearDisplay.addEventListener('click', () => {
                // Get the year from the display text, not from currentDate
                this.currentYear = parseInt(calendarYearDisplay.textContent) || this.currentDate.getFullYear();
                this.showScreen('yearScreen');
                this.updateNavigation('yearViewBtn');
                // Update the year display in the year view
                const yearDisplay = document.getElementById('yearDisplay');
                if (yearDisplay) {
                    yearDisplay.textContent = this.currentYear;
                }
                this.generateYearView();
            });
        }
    }
    
    setupYearNavigation() {
        const prevYear = document.getElementById('prevYear');
        const nextYear = document.getElementById('nextYear');
        
        if (prevYear) prevYear.addEventListener('click', () => this.navigateYear(-1));
        if (nextYear) nextYear.addEventListener('click', () => this.navigateYear(1));
    }
    
    /**
     * Set up navigation listeners for all screens
     */
    setupNavigationListeners() {
        const navItems = [
            'calendarBtn', 'calendarBtnYear', 'calendarBtnArticles', 'calendarBtnProducts',
            'articlesBtn', 'articlesBtnYear', 'articlesBtnArticles', 'articlesBtnProducts',
            'productsBtn', 'productsBtnYear', 'productsBtnArticles', 'productsBtnProducts',
            'logoutBtn', 'logoutBtnYear', 'logoutBtnArticles', 'logoutBtnProducts',
            'deleteDataBtn', 'deleteDataBtnProducts',
            // Mobile navigation items
            'calendarBtnMobile', 'articlesBtnMobile', 'productsBtnMobile', 
            'logoutBtnMobile', 'deleteDataBtnMobile'
        ];
        
        navItems.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('click', () => this.handleNavigation(id));
            }
        });
    }
    
    /**
     * Set up modal event listeners
     */
    setupModalListeners() {
        // Action modal
        const closeModal = document.getElementById('closeModal');
        if (closeModal) {
            closeModal.addEventListener('click', () => this.hideModal('actionModal'));
        }
        
        // Period modal
        const closePeriodModal = document.getElementById('closePeriodModal');
        const savePeriod = document.getElementById('savePeriod');
        const deletePeriod = document.getElementById('deletePeriod');
        const cancelPeriodEdit = document.getElementById('cancelPeriodEdit');
        
        if (closePeriodModal) closePeriodModal.addEventListener('click', () => this.hideModal('periodModal'));
        if (savePeriod) savePeriod.addEventListener('click', () => this.savePeriodEdit());
        if (deletePeriod) deletePeriod.addEventListener('click', () => this.deletePeriod());
        if (cancelPeriodEdit) cancelPeriodEdit.addEventListener('click', () => this.hideModal('periodModal'));
        
        // Note modal
        const closeNoteModal = document.getElementById('closeNoteModal');
        const saveNote = document.getElementById('saveNote');
        const deleteNote = document.getElementById('deleteNote');
        const cancelNote = document.getElementById('cancelNote');
        
        if (closeNoteModal) closeNoteModal.addEventListener('click', () => this.hideModal('noteModal'));
        if (saveNote) saveNote.addEventListener('click', () => this.saveNote());
        if (deleteNote) deleteNote.addEventListener('click', () => this.deleteNote());
        if (cancelNote) cancelNote.addEventListener('click', () => this.hideModal('noteModal'));
        
        // Pregnancy modal
        const closePregnancyModal = document.getElementById('closePregnancyModal');
        const savePregnancy = document.getElementById('savePregnancy');
        const cancelPregnancy = document.getElementById('cancelPregnancy');
        
        if (closePregnancyModal) closePregnancyModal.addEventListener('click', () => this.hideModal('pregnancyModal'));
        if (savePregnancy) savePregnancy.addEventListener('click', () => this.savePregnancy());
        if (cancelPregnancy) cancelPregnancy.addEventListener('click', () => this.hideModal('pregnancyModal'));
        
        // Mood modal
        const closeMoodModal = document.getElementById('closeMoodModal');
        const saveMood = document.getElementById('saveMood');
        const deleteMood = document.getElementById('deleteMood');
        const cancelMood = document.getElementById('cancelMood');
        
        if (closeMoodModal) closeMoodModal.addEventListener('click', () => this.hideModal('moodModal'));
        if (saveMood) saveMood.addEventListener('click', () => this.saveMoodData());
        if (deleteMood) deleteMood.addEventListener('click', () => this.deleteMoodData());
        if (cancelMood) cancelMood.addEventListener('click', () => this.hideModal('moodModal'));
        
        // Medical modal
        const closeMedicalModal = document.getElementById('closeMedicalModal');
        const saveMedical = document.getElementById('saveMedical');
        const deleteMedical = document.getElementById('deleteMedical');
        const cancelMedical = document.getElementById('cancelMedical');
        
        if (closeMedicalModal) closeMedicalModal.addEventListener('click', () => this.hideModal('medicalModal'));
        if (saveMedical) saveMedical.addEventListener('click', () => this.saveMedicalVisit());
        if (deleteMedical) deleteMedical.addEventListener('click', () => this.deleteMedicalVisit());
        if (cancelMedical) cancelMedical.addEventListener('click', () => this.hideModal('medicalModal'));
        
        // Add event listeners for medical time dial controls
        const medicalHour = document.getElementById('medicalHour');
        const medicalMinute = document.getElementById('medicalMinute');
        const medicalHourValue = document.getElementById('medicalHourValue');
        const medicalMinuteValue = document.getElementById('medicalMinuteValue');
        
        if (medicalHour && medicalHourValue) {
            medicalHour.addEventListener('input', (e) => {
                const value = parseInt(e.target.value) || 0;
                medicalHourValue.textContent = value;
            });
        }
        
        if (medicalMinute && medicalMinuteValue) {
            medicalMinute.addEventListener('input', (e) => {
                const value = parseInt(e.target.value) || 0;
                medicalMinuteValue.textContent = value.toString().padStart(2, '0');
            });
        }
        
        // Sex modal
        const closeSexModal = document.getElementById('closeSexModal');
        const saveSex = document.getElementById('saveSex');
        const deleteSex = document.getElementById('deleteSex');
        const cancelSex = document.getElementById('cancelSex');
        if (closeSexModal) closeSexModal.addEventListener('click', () => this.hideModal('sexModal'));
        if (saveSex) saveSex.addEventListener('click', () => this.saveSexActivity());
        if (deleteSex) deleteSex.addEventListener('click', () => this.deleteSexActivity());
        if (cancelSex) cancelSex.addEventListener('click', () => this.hideModal('sexModal'));

        // Confirmation modal
        const closeConfirmModal = document.getElementById('closeConfirmModal');
        const confirmYes = document.getElementById('confirmYes');
        const confirmNo = document.getElementById('confirmNo');
        
        if (closeConfirmModal) closeConfirmModal.addEventListener('click', () => this.hideModal('confirmModal'));
        if (confirmYes) confirmYes.addEventListener('click', () => this.handleConfirmation(true));
        if (confirmNo) confirmNo.addEventListener('click', () => this.handleConfirmation(false));
    }
    
    /**
     * Set up export modal event listeners
     */
    setupExportModalListeners() {
        const closeExportModal = document.getElementById('closeExportModal');
        const exportJSON = document.getElementById('exportJSON');
        const exportXLSX = document.getElementById('exportXLSX');
        
        if (closeExportModal) closeExportModal.addEventListener('click', () => this.hideModal('exportModal'));
        if (exportJSON) exportJSON.addEventListener('click', () => this.exportAsJSON());
        if (exportXLSX) exportXLSX.addEventListener('click', () => this.exportAsXLSX());
    }
    
    /**
     * Handle navigation between screens
     */
    handleNavigation(action) {
        console.log('handleNavigation called with action:', action);
        
        // Close mobile menu if open
        const mobileMenu = document.getElementById('mobileMenu');
        if (mobileMenu && mobileMenu.classList.contains('active')) {
            mobileMenu.classList.remove('active');
        }
        
        switch (action) {
            case 'calendarBtn':
            case 'calendarBtnYear':
            case 'calendarBtnArticles':
            case 'calendarBtnProducts':
            case 'calendarBtnMobile':
            case 'backToCalendarBtn':
            case 'backToCalendarFromArticles':
                this.showScreen('calendarScreen');
                this.updateNavigation('calendarBtn');
                break;
            case 'yearViewBtn':
            case 'yearViewBtnYear':
            case 'yearViewBtnArticles':
            case 'yearViewBtnProducts':
                this.showScreen('yearScreen');
                this.updateNavigation('yearViewBtn');
                this.generateYearView();
                break;
            case 'articlesBtn':
            case 'articlesBtnYear':
            case 'articlesBtnArticles':
            case 'articlesBtnProducts':
            case 'articlesBtnMobile':
                this.showScreen('articlesScreen');
                this.updateNavigation('articlesBtn');
                this.initArticles();
                this.attachArticlesScroll();
                break;
            case 'productsBtn':
            case 'productsBtnYear':
            case 'productsBtnArticles':
            case 'productsBtnProducts':
            case 'productsBtnMobile':
                this.showScreen('productsScreen');
                this.updateNavigation('productsBtn');
                this.initProducts();
                break;
            case 'logoutBtn':
            case 'logoutBtnYear':
            case 'logoutBtnArticles':
            case 'logoutBtnProducts':
            case 'logoutBtnMobile':
                this.logout();
                break;
            case 'deleteDataBtn':
            case 'deleteDataBtnProducts':
            case 'deleteDataBtnMobile':
                this.confirmDeleteAllData();
                break;
        }
    }
    
    /**
     * Show specific screen and hide others
     */
    showScreen(screenId) {
        console.log('showScreen called with screenId:', screenId);
        const allScreens = document.querySelectorAll('.screen');
        console.log('Found', allScreens.length, 'screens total');
        
        allScreens.forEach(screen => {
            console.log('Removing active from screen:', screen.id);
            screen.classList.remove('active');
        });
        
        const targetScreen = document.getElementById(screenId);
        console.log('Target screen element:', targetScreen);
        
        if (targetScreen) {
            targetScreen.classList.add('active');
            console.log('Added active class to:', screenId);
        } else {
            console.error('Target screen not found:', screenId);
        }
        
        this.currentView = screenId.replace('Screen', '');
        console.log('Updated currentView to:', this.currentView);
    }
    
    /**
     * Update navigation active states
     */
    updateNavigation(activeId) {
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        
        // Update all instances of the nav item
        const baseId = activeId.replace(/Btn(Year|Articles)?$/, 'Btn');
        document.querySelectorAll(`[id^="${baseId}"]`).forEach(item => {
            item.classList.add('active');
        });
    }
    
    /**
     * Encryption/Decryption functions
     */
    encrypt(data, password) {
        try {
            return CryptoJS.AES.encrypt(JSON.stringify(data), password).toString();
        } catch (error) {
            console.error('Encryption failed:', error);
            return null;
        }
    }
    
    decrypt(encryptedData, password) {
        try {
            if (!password) return null;
            const bytes = CryptoJS.AES.decrypt(encryptedData, password);
            const decryptedData = bytes.toString(CryptoJS.enc.Utf8);
            return JSON.parse(decryptedData);
        } catch (error) {
            console.warn('Decryption failed');
            return null;
        }
    }

    deriveKey(username, password) {
        const u = (username || '').trim().toLowerCase();
        const p = password || '';
        // Salted, double-hashed key derivation
        const first = CryptoJS.SHA256(`${this.KEY_SALT}|${u}|${p}`).toString();
        const finalKey = CryptoJS.SHA256(`${this.KEY_SALT}|${first}`).toString();
        return finalKey;
    }
    
    /**
     * Storage abstraction for both Chrome extension and Cordova
     */
    async getStorage(keys) {
        // Check if we're in a Cordova environment
        if (typeof cordova !== 'undefined') {
            return new Promise((resolve) => {
                const result = {};
                if (Array.isArray(keys)) {
                    keys.forEach((key) => {
                        const value = localStorage.getItem(key);
                        if (value) {
                            try {
                                result[key] = JSON.parse(value);
                            } catch (e) {
                                result[key] = value;
                            }
                        }
                    });
                } else if (typeof keys === 'string') {
                    const value = localStorage.getItem(keys);
                    if (value) {
                        try {
                            result[keys] = JSON.parse(value);
                        } catch (e) {
                            result[keys] = value;
                        }
                    }
                } else {
                    // Get all items
                    for (let i = 0; i < localStorage.length; i++) {
                        const key = localStorage.key(i);
                        const value = localStorage.getItem(key);
                        try {
                            result[key] = JSON.parse(value);
                        } catch (e) {
                            result[key] = value;
                        }
                    }
                }
                resolve(result);
            });
        } else {
            // Chrome extension environment
            return await chrome.storage.local.get(keys);
        }
    }
    
    async setStorage(items) {
        // Check if we're in a Cordova environment
        if (typeof cordova !== 'undefined') {
            return new Promise((resolve) => {
                Object.keys(items).forEach((key) => {
                    localStorage.setItem(key, JSON.stringify(items[key]));
                });
                resolve();
            });
        } else {
            // Chrome extension environment
            return await chrome.storage.local.set(items);
        }
    }
    
    async clearStorage() {
        // Check if we're in a Cordova environment
        if (typeof cordova !== 'undefined') {
            return new Promise((resolve) => {
                localStorage.clear();
                resolve();
            });
        } else {
            // Chrome extension environment
            return await chrome.storage.local.clear();
        }
    }
    
    /**
     * Authentication functions
     */
    // Login removed
    
    /**
     * Check if user is already authenticated
     */
    async handleLogin(event) {
        console.log('handleLogin called with event:', event);
        event.preventDefault();
        console.log('Event prevented successfully');
        
        const usernameElement = document.getElementById('username');
        const passwordElement = document.getElementById('password');
        console.log('Username element:', usernameElement);
        console.log('Password element:', passwordElement);
        
        const username = usernameElement ? usernameElement.value.trim() : '';
        const password = passwordElement ? passwordElement.value : '';
        console.log('Username value:', username ? `"${username}"` : 'empty');
        console.log('Password value:', password ? `(length: ${password.length})` : 'empty');
        
        if (!username || !password) {
            console.log('Validation failed - missing username or password');
            alert('Please enter both username and password');
            return;
        }
        console.log('Basic validation passed');
        const key = this.deriveKey(username, password);
        try {
            const result = await this.getStorage(['fema_user']);
            if (result.fema_user) {
                const userData = this.decrypt(result.fema_user, key);
                if (userData && userData.username === username) {
                    this.currentUser = username;
                    this.currentPassword = key;
                    await this.loadUserData();
                    this.showScreen('calendarScreen');
                    this.updateNavigation('calendarBtn');
                    this.updateCalendar();
                } else {
                    alert('Invalid username or password');
                }
            } else {
                const userData = { username, createdAt: new Date().toISOString() };
                const encryptedData = this.encrypt(userData, key);
                await this.setStorage({ fema_user: encryptedData });
                this.currentUser = username;
                this.currentPassword = key;
                await this.loadUserData();
                this.showScreen('calendarScreen');
                this.updateNavigation('calendarBtn');
                this.updateCalendar();
                alert('Account created successfully!');
            }
        } catch (err) {
            console.error('Login error:', err);
            alert('Login failed. Please try again.');
        }
    }

    async checkAuthentication() {
        try {
            const result = await this.getStorage(['fema_user']);
            if (result.fema_user) {
                // User is authenticated, load their data and show calendar
                const userData = this.decrypt(result.fema_user, this.currentPassword);
                if (userData) {
                    this.currentUser = userData.username;
                    await this.loadUserData();
                    this.showScreen('calendarScreen');
                    this.updateNavigation('calendarBtn');
                    this.updateCalendar();
                } else {
                    // Invalid data, show login screen
                    this.showScreen('loginScreen');
                }
            } else {
                // No user data, show login screen
                this.showScreen('loginScreen');
            }
        } catch (error) {
            console.error('Authentication check failed:', error);
            this.showScreen('loginScreen');
        } finally {
            // Hide loading overlay once authentication check is complete
            const loadingOverlay = document.getElementById('loadingOverlay');
            if (loadingOverlay) {
                loadingOverlay.style.display = 'none';
            }
        }
    }
    
    /**
     * Load all user data
     */
    async loadUserData() {
        try {
            const keys = ['fema_period_data', 'fema_notes', 'fema_sex_data', 'fema_gynecologist_data', 'fema_pregnancy_data', 'fema_mood_data'];
            const result = await this.getStorage(keys);
            
            this.periodData = result.fema_period_data ? this.decrypt(result.fema_period_data, this.currentPassword) || {} : {};
            this.notesData = result.fema_notes ? this.decrypt(result.fema_notes, this.currentPassword) || {} : {};
            this.sexData = result.fema_sex_data ? this.decrypt(result.fema_sex_data, this.currentPassword) || {} : {};
            this.gynecologistData = result.fema_gynecologist_data ? this.decrypt(result.fema_gynecologist_data, this.currentPassword) || {} : {};
            this.pregnancyData = result.fema_pregnancy_data ? this.decrypt(result.fema_pregnancy_data, this.currentPassword) || {} : {};
            this.moodData = result.fema_mood_data ? this.decrypt(result.fema_mood_data, this.currentPassword) || {} : {};
        } catch (error) {
            console.error('Failed to load user data:', error);
            // Initialize empty data structures
            this.periodData = {};
            this.notesData = {};
            this.sexData = {};
            this.gynecologistData = {};
            this.pregnancyData = {};
            this.moodData = {};
        }
    }
    
    /**
     * Save data to encrypted storage
     */
    async saveData(key, data) {
        try {
            const encryptedData = this.encrypt(data, this.currentPassword);
            if (encryptedData) {
                await this.setStorage({ [key]: encryptedData });
                return true;
            }
            return false;
        } catch (error) {
            console.error('Failed to save data:', error);
            return false;
        }
    }
    
    /**
     * Logout functionality
     */
    logout() {
        // Clear in-memory state and go to login screen
        this.currentUser = null;
        this.currentPassword = null;
        this.periodData = {};
        this.notesData = {};
        this.sexData = {};
        this.gynecologistData = {};
        this.pregnancyData = {};
        this.moodData = {};
        this.showScreen('loginScreen');
    }
    
    /**
     * Delete all data with confirmation
     */
    confirmDeleteAllData() {
        this.requireDeleteText = true;
        this.showConfirmModal(
            'Delete All Data',
            "This will permanently delete all your period tracking data. Please type 'delete' to confirm.",
            () => this.deleteAllData()
        );
    }
    
    async deleteAllData() {
        try {
            await this.clearStorage();
            this.logout();
            alert('All data has been deleted successfully.');
        } catch (error) {
            console.error('Failed to delete data:', error);
            alert('Failed to delete data. Please try again.');
        }
    }
    
    /**
     * Calendar functionality
     */
    updateCalendar() {
        this.generateMainCalendar();
        this.generateSideCalendars();
        this.updateMonthDisplay();
    }
    
    generateMainCalendar() {
        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();
        const today = new Date();
        
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startDate = new Date(firstDay);
        startDate.setDate(startDate.getDate() - firstDay.getDay());
        
        const calendarGrid = document.getElementById('calendarGrid');
        if (!calendarGrid) return;
        
        calendarGrid.innerHTML = '';
        
        // Generate 6 weeks (42 days)
        for (let week = 0; week < 6; week++) {
            // Add week number
            const weekNumber = this.getWeekNumber(new Date(startDate.getTime() + (week * 7 + 3) * 24 * 60 * 60 * 1000));
            const weekElement = document.createElement('div');
            weekElement.className = 'week-number';
            weekElement.textContent = weekNumber;
            calendarGrid.appendChild(weekElement);
            
            // Add 7 days for this week
            for (let day = 0; day < 7; day++) {
                const date = new Date(startDate);
                date.setDate(startDate.getDate() + (week * 7) + day);
                
                const dayElement = document.createElement('div');
                dayElement.className = 'calendar-day';
                dayElement.dataset.date = this.formatDate(date);
                
                // Add classes for styling
                if (date.getMonth() !== month) {
                    dayElement.classList.add('other-month');
                    dayElement.textContent = ''; // No text for other month days
                    
                    // Don't apply pregnancy coloring to empty cells (other-month days)
                    // as they don't show any text content
                } else {
                    dayElement.textContent = date.getDate();

                    // Weekend/current-day styles only for current month cells
                    if (date.getDay() === 0 || date.getDay() === 6) {
                        dayElement.classList.add('weekend');
                    }
                    if (this.isSameDate(date, today)) {
                        dayElement.classList.add('today');
                    }
                    
                    // Add period tracking classes (current month only)
                    this.addPeriodClasses(dayElement, date);
                    
                    // Add indicators (current month only)
                    this.addIndicators(dayElement, date);
                    
                    // Add event listeners (current month only)
                    dayElement.addEventListener('click', () => this.handleDateDoubleClick(date));
                    dayElement.addEventListener('mouseenter', (e) => this.showTooltip(e, date));
                    dayElement.addEventListener('mouseleave', () => this.hideTooltip());
                }
                
                calendarGrid.appendChild(dayElement);
            }
        }
    }
    
    generateSideCalendars() {
        const prevMonth = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() - 1, 1);
        const nextMonth = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 1);
        
        this.generateMiniCalendar('prevCalendar', prevMonth);
        this.generateMiniCalendar('nextCalendar', nextMonth);
        
        const prevMonthHeader = document.getElementById('prevMonthHeader');
        const nextMonthHeader = document.getElementById('nextMonthHeader');
        
        if (prevMonthHeader) prevMonthHeader.textContent = this.getMonthName(prevMonth.getMonth()).toUpperCase();
        if (nextMonthHeader) nextMonthHeader.textContent = this.getMonthName(nextMonth.getMonth()).toUpperCase();
    }
    
    generateMiniCalendar(containerId, date) {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const startDate = new Date(firstDay);
        startDate.setDate(startDate.getDate() - firstDay.getDay());
        const today = new Date(); // Get today's date for comparison

        const container = document.getElementById(containerId);
        if (!container) return;
        
        container.innerHTML = '';
        
        // Add day headers (Mo Tu We Th Fr Sa Su)
        const dayHeaders = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
        dayHeaders.forEach(header => {
            const headerElement = document.createElement('div');
            headerElement.className = 'mini-day-header';
            headerElement.textContent = header;
            container.appendChild(headerElement);
        });
        
        for (let i = 0; i < 42; i++) {
            const currentDate = new Date(startDate);
            currentDate.setDate(startDate.getDate() + i);
            
            const dayElement = document.createElement('div');
            dayElement.className = 'mini-day';
            
            if (currentDate.getMonth() !== month) {
                dayElement.classList.add('other-month');
                dayElement.textContent = ''; // No text for other month days
                
                // Don't apply pregnancy coloring to empty cells in mini calendars
                // (other-month days are shown as empty)
            } else {
                dayElement.textContent = currentDate.getDate();
                // Weekend style only for current month cells
                if (currentDate.getDay() === 0 || currentDate.getDay() === 6) {
                    dayElement.classList.add('weekend');
                }
                // Today styling
                if (this.isSameDate(currentDate, today)) {
                    dayElement.classList.add('today');
                }
                // Pregnancy coloring in mini calendar
                const ps = this.getPregnancyState(currentDate);
                if (ps.state !== 'none') {
                    dayElement.classList.add(ps.state);
                    if (ps.due) dayElement.classList.add('due-marker');
                } else {
                    // Color codes only for current month cells
                    if (this.isPeriodDay(currentDate)) {
                        dayElement.classList.add('period-day');
                        const flowIntensity = this.getPeriodFlow(currentDate);
                        if (flowIntensity) dayElement.classList.add(`flow-${flowIntensity}`);
                    }
                    if (this.isFertilityDay(currentDate)) {
                        dayElement.classList.add('fertility-day');
                    }
                    if (this.isOvulationDay(currentDate)) {
                        dayElement.classList.add('ovulation-day');
                    }
                }
            }
            
            container.appendChild(dayElement);
        }
    }
    
    updateMonthDisplay() {
        const monthName = this.getMonthName(this.currentDate.getMonth()).toUpperCase();
        console.log('Updating month display to:', monthName, 'Current date:', this.currentDate);
        const monthDisplay = document.getElementById('monthDisplay');
        const yearAbove = document.getElementById('calendarYearDisplay');
        if (monthDisplay) {
            monthDisplay.textContent = monthName;
            console.log('Month display element updated with:', monthName);
        } else {
            console.log('Month display element not found!');
        }
        if (yearAbove) yearAbove.textContent = this.currentDate.getFullYear();
    }
    
    /**
     * Utility functions for remaining methods
     */
    populateSymptoms(symptoms) {
        document.querySelectorAll('input[name="symptoms"]').forEach(checkbox => {
            checkbox.checked = symptoms.includes(checkbox.value);
        });
    }
    
    clearSymptoms() {
        document.querySelectorAll('input[name="symptoms"]').forEach(checkbox => {
            checkbox.checked = false;
        });
    }
    
    populateDateSelectors(prefix, date) {
        const daySelect = document.getElementById(`${prefix}Day`);
        const monthSelect = document.getElementById(`${prefix}Month`);
        const yearSelect = document.getElementById(`${prefix}Year`);
        
        if (!daySelect || !monthSelect || !yearSelect) return;
        
        // Clear existing options
        daySelect.innerHTML = '';
        monthSelect.innerHTML = '';
        yearSelect.innerHTML = '';
        
        // Populate days (1-31)
        for (let i = 1; i <= 31; i++) {
            const option = document.createElement('option');
            option.value = i;
            option.textContent = i;
            if (i === date.getDate()) option.selected = true;
            daySelect.appendChild(option);
        }
        
        // Populate months (0-11)
        for (let i = 0; i < 12; i++) {
            const option = document.createElement('option');
            option.value = i;
            option.textContent = this.getMonthName(i);
            if (i === date.getMonth()) option.selected = true;
            monthSelect.appendChild(option);
        }
        
        // Populate years (current year ± 10)
        const currentYear = new Date().getFullYear();
        for (let i = currentYear - 10; i <= currentYear + 2; i++) {
            const option = document.createElement('option');
            option.value = i;
            option.textContent = i;
            if (i === date.getFullYear()) option.selected = true;
            yearSelect.appendChild(option);
        }
    }
    
    /**
     * Core utility methods that are referenced throughout
     */
    getMonthName(monthIndex) {
        const months = ['January', 'February', 'March', 'April', 'May', 'June',
                       'July', 'August', 'September', 'October', 'November', 'December'];
        return months[monthIndex];
    }
    
    getWeekNumber(date) {
        const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
        const dayNum = d.getUTCDay() || 7;
        d.setUTCDate(d.getUTCDate() + 4 - dayNum);
        const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
        return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    }
    
    isSameDate(date1, date2) {
        return date1.getFullYear() === date2.getFullYear() &&
               date1.getMonth() === date2.getMonth() &&
               date1.getDate() === date2.getDate();
    }
    
    formatDate(date) {
        // Use local date components to avoid timezone shifts
        const y = date.getFullYear();
        const m = (date.getMonth() + 1).toString().padStart(2, '0');
        const d = date.getDate().toString().padStart(2, '0');
        return `${y}-${m}-${d}`;
    }
    
    parseDate(dateString) {
        // Construct local date at midday to avoid DST edge cases
        const [y, m, d] = dateString.split('-').map(Number);
        return new Date(y, (m - 1), d, 12, 0, 0, 0);
    }

    normalizeDate(date) {
        // Normalize to local midday for stable day-diff calculations
        return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12, 0, 0, 0);
    }

    addMonths(date, months) {
        const d = new Date(date);
        const day = d.getDate();
        d.setMonth(d.getMonth() + months);
        // Handle month rollover for shorter months
        if (d.getDate() < day) {
            d.setDate(0);
        }
        return this.normalizeDate(d);
    }

    getPregnancyState(date) {
        if (!this.pregnancyData.startDate) return { state: 'none', due: false };
        const nd = this.normalizeDate(date);
        const start = this.parseDate(this.pregnancyData.startDate);
        const dueEnd = this.addMonths(start, 9);
        const today = this.normalizeDate(new Date());
        const hasBirth = !!this.pregnancyData.birthDate;
        const birth = hasBirth ? this.parseDate(this.pregnancyData.birthDate) : null;

        // Check if this is the birth date specifically
        if (this.isBirthDate(date)) {
            return { state: 'birth-day', due: false };
        }

        // If there's a birth date, pregnancy ends at birth date (not due date)
        const pregnancyEnd = hasBirth ? birth : dueEnd;
        
        if (nd >= start && nd < pregnancyEnd) {
            return { state: 'pregnancy-day', due: nd.getTime() === dueEnd.getTime() };
        }
        
        // Only show overdue if there's no birth date yet
        if (!hasBirth) {
            const isOverdueNow = today > dueEnd;
            if (isOverdueNow && nd >= dueEnd && nd <= today) {
                return { state: 'pregnancy-overdue-day', due: nd.getTime() === dueEnd.getTime() };
            }
        }
        
        return { state: 'none', due: nd.getTime() === dueEnd.getTime() };
    }
    
    navigateMonth(direction) {
        this.currentDate.setMonth(this.currentDate.getMonth() + direction);
        this.updateCalendar();
    }
    
    navigateYear(direction) {
        this.currentYear += direction;
        const yearDisplay = document.getElementById('yearDisplay');
        if (yearDisplay) {
            yearDisplay.textContent = this.currentYear;
        }
        this.generateYearView();
    }
    
    addPeriodClasses(dayElement, date) {
        // Pregnancy coloring and blocking
        const p = this.getPregnancyState(date);
        if (p.state !== 'none') {
            dayElement.classList.add(p.state);
            if (p.due) dayElement.classList.add('due-marker');
            return;
        }

        const isPeriod = this.isPeriodDay(date);
        const isFertility = this.isFertilityDay(date);
        const isOvulation = this.isOvulationDay(date);

        if (isPeriod) {
            dayElement.classList.add('period-day');
            const flowIntensity = this.getPeriodFlow(date);
            if (flowIntensity) {
                dayElement.classList.add(`flow-${flowIntensity}`);
            }
        }

        // Fertility tint and ovulation color
        if (isFertility) dayElement.classList.add('fertility-day');
        if (isOvulation) dayElement.classList.add('ovulation-day');

        // Prediction tinting only if not period/fertile/ovulation
        if (!isPeriod && !isFertility && !isOvulation) {
            const nextPeriod = this.calculateNextPeriod();
            if (nextPeriod) {
                const a = this.normalizeDate(date).getTime();
                const b = this.normalizeDate(nextPeriod).getTime();
                const dd = Math.round(Math.abs(a - b) / (1000 * 60 * 60 * 24));
                if (dd === 0) {
                    dayElement.classList.add('predicted-exact');
                } else if (dd <= 7) {
                    dayElement.classList.add('predicted-range');
                }
            }
        }
    }
    
    isPeriodDay(date) {
        const dateKey = this.formatDate(date);
        return this.periodData[dateKey] && this.periodData[dateKey].isPeriod;
    }
    
    getPeriodFlow(date) {
        const dateKey = this.formatDate(date);
        return this.periodData[dateKey] ? this.periodData[dateKey].flow : 3;
    }
    
    isOvulationDay(date) {
        const ovulationDate = this.calculateOvulation(date);
        return ovulationDate && this.isSameDate(date, ovulationDate);
    }
    
    isFertilityDay(date) {
        const ovulationDate = this.calculateOvulation(date);
        if (!ovulationDate) return false;
        
        const a = this.normalizeDate(date).getTime();
        const b = this.normalizeDate(ovulationDate).getTime();
        const dayDiff = Math.round((a - b) / (1000 * 60 * 60 * 24));
        
        return dayDiff >= -3 && dayDiff <= 1;
    }
    
    isPredictedPeriodDay(date) {
        const nextPeriod = this.calculateNextPeriod();
        if (!nextPeriod) return false;
        
        const a = this.normalizeDate(date).getTime();
        const b = this.normalizeDate(nextPeriod).getTime();
        const dayDiff = Math.round(Math.abs(a - b) / (1000 * 60 * 60 * 24));
        
        return dayDiff <= 7;
    }
    
    calculateOvulation(refDate) {
        const nextPeriod = this.calculateNextPeriod(refDate);
        if (!nextPeriod) return null;
        const ovulationDate = new Date(nextPeriod);
        ovulationDate.setDate(ovulationDate.getDate() - 14);
        return ovulationDate;
    }
    
    getRelevantPeriodStarts() {
        const allStarts = Object.keys(this.periodData)
            .filter(k => this.periodData[k].isPeriod && this.periodData[k].isStart)
            .map(k => this.parseDate(k))
            .sort((a, b) => a - b);
        if (this.pregnancyData.birthDate) {
            const birth = this.parseDate(this.pregnancyData.birthDate);
            return allStarts.filter(d => d > birth);
        }
        return allStarts;
    }

    calculateNextPeriod(refDate) {
        const starts = this.getRelevantPeriodStarts();
        if (starts.length === 0) return null;

        // If no reference date passed, use most recent start
        if (!refDate) {
            const lastPeriod = starts[starts.length - 1];
            const cycleLength = this.calculateAverageCycleLength() || 28;
            const next = new Date(lastPeriod);
            next.setDate(next.getDate() + cycleLength);
            return next;
        }

        // Find last start on or before refDate
        let lastOnOrBefore = null;
        for (const s of starts) {
            if (s <= refDate) lastOnOrBefore = s; else break;
        }
        if (!lastOnOrBefore) return null;

        const cycleLength = this.calculateAverageCycleLength() || 28;
        const next = new Date(lastOnOrBefore);
        next.setDate(next.getDate() + cycleLength);
        return next;
    }
    
    calculateAverageCycleLength() {
        const periodStarts = this.getRelevantPeriodStarts();
        
        if (periodStarts.length < 2) return 28;
        
        const cycles = [];
        for (let i = 1; i < periodStarts.length; i++) {
            const cycleDays = Math.floor((periodStarts[i] - periodStarts[i-1]) / (1000 * 60 * 60 * 24));
            cycles.push(cycleDays);
        }
        
        return Math.round(cycles.reduce((sum, cycle) => sum + cycle, 0) / cycles.length);
    }
    
    addIndicators(dayElement, date) {
        const dateKey = this.formatDate(date);
        const container = document.createElement('div');
        container.className = 'indicators grid-3x3';

        let iconCount = 0;
        const addIcon = (cls, char, type) => {
            if (iconCount >= 4) return; // cap to 2x2 grid
            const span = document.createElement('span');
            span.className = `indicator ${cls}`;
            span.textContent = char;
            span.dataset.eventType = type;
            span.addEventListener('mouseenter', (e) => {
                e.stopPropagation();
                this.showTooltip(e, date, type);
            });
            span.addEventListener('mouseleave', (e) => {
                e.stopPropagation();
                this.hideTooltip();
            });
            container.appendChild(span);
            iconCount++;
        };

        if (this.sexData[dateKey]) {
            addIcon('sex-activity', '♥', 'sex');
        }
        if (this.gynecologistData[dateKey]) addIcon('medical-visit', '▼', 'medical');
        if (this.notesData[dateKey]) addIcon('note-indicator', '★', 'note');
        if (this.moodData[dateKey]) addIcon('mood-indicator', '●', 'mood');

        // Pregnancy monthly hint: active woman rectangle on month boundaries (1..9)
        const hint = this.getPregnancyReminderForDate?.(date);
        if (hint) {
            if (iconCount < 4) {
                const span = document.createElement('span');
                span.className = 'indicator pregnancy-hint';
                span.addEventListener('mouseenter', (e) => {
                    e.stopPropagation();
                    this.showTooltip(e, date, 'pregnancyHint');
                });
                span.addEventListener('mouseleave', (e) => {
                    e.stopPropagation();
                    this.hideTooltip();
                });
                container.appendChild(span);
                iconCount++;
            }
        }

        if (container.childNodes.length > 0) dayElement.appendChild(container);
    }
    
    handleDateDoubleClick(date) {
        this.selectedDate = date;
        const actions = this.getAvailableActions(date);
        this.showActionModal(actions, date);
    }
    
    getAvailableActions(date) {
        const actions = [];
        const isPregnant = this.isPregnant(date);
        const isPostBirth = this.isPostBirth(date);
        const isPeriod = this.isPeriodDay(date);
        const canSetPeriod = this.canSetPeriodStart(date);
        const isBirth = this.isBirthDate(date);
        
        if (canSetPeriod && !isPregnant) {
            actions.push({ text: 'Period Start', action: 'periodStart' });
        }
        
        if (isPeriod) {
            actions.push({ text: 'Edit Period Length', action: 'editPeriodLength' });
            actions.push({ text: 'Edit Flow Intensity', action: 'editFlowIntensity' });
        }
        
        actions.push({ text: 'Add Note', action: 'addNote' });
        
        if (!isPregnant && !isPostBirth) {
            actions.push({ text: 'Set Pregnancy Beginning', action: 'setPregnancy' });
        }
        
        if (isPregnant && !isBirth) {
            const hasBirth = !!this.pregnancyData.birthDate;
            actions.push({ text: hasBirth ? 'Edit Birth Date' : 'Set Birth Date', action: 'setBirthDate' });
        }
        
        // Special case: if user double-clicks on the birth date itself, offer to edit it
        if (isBirth) {
            actions.push({ text: 'Edit Birth Date', action: 'setBirthDate' });
        }
        
        actions.push({ text: 'Sexual Activity', action: 'sexActivity' });
        actions.push({ text: 'Gynecologist Visit', action: 'gynecologistVisit' });
        actions.push({ text: 'Mood & Health', action: 'moodHealth' });
        
        return actions;
    }
    
    canSetPeriodStart(date) {
        const hasNoPeriods = Object.keys(this.periodData).length === 0;
        const isPredicted = this.isPredictedPeriodDay(date);
        // Allow at any day after birth
        if (this.pregnancyData.birthDate) {
            const birth = this.parseDate(this.pregnancyData.birthDate);
            if (date >= birth) return true;
        }
        // Disallow during pregnancy (including overdue window without birth)
        if (this.isPregnant(date)) return false;
        // Fallbacks
        return hasNoPeriods || isPredicted;
    }
    
    isPregnant(date) {
        if (!this.pregnancyData.startDate) return false;
        
        const pregnancyStart = this.parseDate(this.pregnancyData.startDate);
        const birthDate = this.pregnancyData.birthDate ? this.parseDate(this.pregnancyData.birthDate) : null;
        
        if (birthDate) {
            // Pregnancy ends at birth date, but birth date itself is not "pregnant"
            return date >= pregnancyStart && date < birthDate;
        }
        
        return date >= pregnancyStart;
    }
    
    isPostBirth(date) {
        if (!this.pregnancyData.birthDate) return false;
        
        const birthDate = this.parseDate(this.pregnancyData.birthDate);
        const timeDiff = date.getTime() - birthDate.getTime();
        const dayDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
        
        return dayDiff >= 0 && dayDiff <= 30;
    }
    
    isBirthDate(date) {
        if (!this.pregnancyData.birthDate) return false;
        const birthDate = this.parseDate(this.pregnancyData.birthDate);
        return this.isSameDate(date, birthDate);
    }
    
    showActionModal(actions, date) {
        const modal = document.getElementById('actionModal');
        const buttonsContainer = document.getElementById('actionButtons');
        const title = document.getElementById('modalTitle');
        
        if (!modal || !buttonsContainer || !title) return;
        
        title.textContent = `Actions for ${date.toLocaleDateString()}`;
        buttonsContainer.innerHTML = '';
        
        actions.forEach(action => {
            const button = document.createElement('button');
            button.className = 'action-button';
            button.textContent = action.text;
            button.addEventListener('click', () => {
                this.hideModal('actionModal');
                this.handleAction(action.action, date);
            });
            buttonsContainer.appendChild(button);
        });
        
        this.showModal('actionModal');
    }
    
    handleAction(action, date) {
        switch (action) {
            case 'periodStart': this.setPeriodStart(date); break;
            case 'editPeriodLength': this.showEditPeriodModal(date, 'length'); break;
            case 'editFlowIntensity': this.showEditPeriodModal(date, 'flow'); break;
            case 'addNote': this.showNoteModal(date); break;
            case 'setPregnancy': this.showPregnancyModal(date, 'start'); break;
            case 'setBirthDate': this.showPregnancyModal(date, 'birth'); break;
            case 'sexActivity': this.showSexModal(date); break;
            case 'gynecologistVisit': this.showMedicalModal(date); break;
            case 'moodHealth': this.showMoodModal(date); break;
        }
    }
    
    showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('active');
        }
    }
    
    hideModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
        }
    }
    
    showConfirmModal(title, message, callback) {
        const titleEl = document.getElementById('confirmTitle');
        const messageEl = document.getElementById('confirmMessage');
        const inputWrap = document.getElementById('confirmInputWrap');
        const inputEl = document.getElementById('confirmInput');
        
        if (titleEl) titleEl.textContent = title;
        if (messageEl) messageEl.textContent = message;
        this.confirmCallback = callback;
        if (inputWrap) inputWrap.style.display = this.requireDeleteText ? 'block' : 'none';
        if (inputEl) inputEl.value = '';
        this.showModal('confirmModal');
    }
    
    handleConfirmation(confirmed) {
        if (confirmed && this.requireDeleteText) {
            const val = (document.getElementById('confirmInput')?.value || '').trim().toLowerCase();
            if (val !== 'delete') {
                alert("Please type 'delete' to confirm.");
                return;
            }
        }
        this.hideModal('confirmModal');
        if (confirmed && this.confirmCallback) this.confirmCallback();
        this.confirmCallback = null;
        this.requireDeleteText = false;
    }
    
    async setPeriodStart(date) {
        // Check if the selected date is in the future
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Normalize to start of day for comparison
        const selectedDate = new Date(date);
        selectedDate.setHours(0, 0, 0, 0); // Normalize to start of day for comparison
        
        if (selectedDate > today) {
            // Show confirmation dialog for future dates
            this.showConfirmModal(
                'Future Date Warning',
                'Selected period start date is in the future, are you sure to proceed?',
                async () => {
                    // User confirmed, proceed with setting the period
                    await this._setPeriodStartConfirmed(date);
                }
            );
        } else {
            // Date is today or in the past, proceed normally
            await this._setPeriodStartConfirmed(date);
        }
    }
    
    async _setPeriodStartConfirmed(date) {
        const dateKey = this.formatDate(date);
        const periodLength = 5;
        
        for (let i = 0; i < periodLength; i++) {
            const periodDate = new Date(date);
            periodDate.setDate(date.getDate() + i);
            const periodDateKey = this.formatDate(periodDate);
            
            this.periodData[periodDateKey] = {
                isPeriod: true,
                isStart: i === 0,
                flow: 3,
                length: periodLength
            };
        }
        
        await this.saveData('fema_period_data', this.periodData);
        this.updateCalendar();
    }
    
    showEditPeriodModal(date, mode) {
        const dateKey = this.formatDate(date);
        const periodData = this.periodData[dateKey];
        const start = this.findPeriodStart(date);
        
        // Populate selectors with the period start for length edit
        this.populateDateSelectors('period', start);
        
        const flowRange = document.getElementById('flowRange');
        const periodLength = document.getElementById('periodLength');
        const dateSelectors = document.querySelector('#periodModal .date-selectors');
        const header = document.querySelector('#periodModal .modal-header h3');
        this.selectedEditMode = mode || 'length';
        
        if (flowRange) flowRange.value = periodData.flow || 3;
        if (periodLength) periodLength.value = periodData.length || 5;
        // Show only relevant controls per mode
        if (dateSelectors) dateSelectors.style.display = (this.selectedEditMode === 'length') ? 'flex' : 'none';
        const flowWrap = document.getElementById('flowControl');
        const lengthWrap = document.getElementById('lengthControl');
        if (flowWrap) flowWrap.style.display = (this.selectedEditMode === 'flow') ? 'block' : 'none';
        if (lengthWrap) lengthWrap.style.display = (this.selectedEditMode === 'length') ? 'block' : 'none';
        if (header) header.textContent = this.selectedEditMode === 'flow' ? 'Edit Flow Intensity' : 'Edit Period Length';
        
        this.showModal('periodModal');
    }
    
    async savePeriodEdit() {
        const dayEl = document.getElementById('periodDay');
        const monthEl = document.getElementById('periodMonth');
        const yearEl = document.getElementById('periodYear');
        const flowEl = document.getElementById('flowRange');
        const lengthEl = document.getElementById('periodLength');
        
        if (!dayEl || !monthEl || !yearEl || !flowEl || !lengthEl) return;
        
        const day = parseInt(dayEl.value);
        const month = parseInt(monthEl.value);
        const year = parseInt(yearEl.value);
        const flow = parseInt(flowEl.value);
        const length = parseInt(lengthEl.value);
        
        if (this.selectedEditMode === 'length') {
            await this.savePeriodLength(length);
        } else {
            await this.saveFlowIntensity(flow);
        }
    }

    findPeriodStart(fromDate) {
        // Find the start date for the period containing fromDate
        let start = new Date(fromDate);
        while (true) {
            const prev = new Date(start);
            prev.setDate(prev.getDate() - 1);
            const prevKey = this.formatDate(prev);
            if (!this.periodData[prevKey]) break;
            start = prev;
            if (this.periodData[prevKey].isStart) break;
        }
        return start;
    }

    async savePeriodLength(newLength) {
        if (!this.selectedDate) return;
        // Read start from selectors to allow moving start date
        const sd = document.getElementById('periodDay');
        const sm = document.getElementById('periodMonth');
        const sy = document.getElementById('periodYear');
        const selStart = (sd && sm && sy)
            ? new Date(parseInt(sy.value), parseInt(sm.value), parseInt(sd.value))
            : this.findPeriodStart(this.selectedDate);
        const start = selStart;
        
        // Determine old period info from the previous start
        const prevStart = this.findPeriodStart(this.selectedDate);
        const prevStartKey = this.formatDate(prevStart);
        const oldLen = this.periodData[prevStartKey]?.length || 5;
        
        // Save existing flow data for days that will remain in the period
        const flowData = {};
        for (let i = 0; i < Math.min(oldLen, newLength); i++) {
            const d = new Date(prevStart);
            d.setDate(prevStart.getDate() + i);
            const key = this.formatDate(d);
            if (this.periodData[key]) {
                flowData[key] = this.periodData[key].flow;
            }
        }
        
        // Remove old mapping
        for (let i = 0; i < oldLen; i++) {
            const d = new Date(prevStart);
            d.setDate(prevStart.getDate() + i);
            delete this.periodData[this.formatDate(d)];
        }
        
        // Add new mapping
        for (let i = 0; i < newLength; i++) {
            const d = new Date(start);
            d.setDate(start.getDate() + i);
            const key = this.formatDate(d);
            // Use existing flow data if available, otherwise default to start day flow or 3
            const flow = i === 0 ? (this.periodData[prevStartKey]?.flow || 3) : 
                         (flowData[key] || this.periodData[prevStartKey]?.flow || 3);
            this.periodData[key] = {
                isPeriod: true,
                isStart: i === 0,
                flow: flow,
                length: newLength
            };
        }
        await this.saveData('fema_period_data', this.periodData);
        this.hideModal('periodModal');
        this.updateCalendar();
    }

    async saveFlowIntensity(flow) {
        if (!this.selectedDate) return;
        const key = this.formatDate(this.selectedDate);
        if (this.periodData[key]) {
            const len = this.periodData[key].length || 5;
            const isStart = !!this.periodData[key].isStart;
            this.periodData[key].flow = flow;
            this.periodData[key].length = len;
            this.periodData[key].isStart = isStart;
        }
        await this.saveData('fema_period_data', this.periodData);
        this.hideModal('periodModal');
        this.updateCalendar();
    }
    
    // Additional methods for complete functionality
    async deletePeriod() {
        try {
            if (!this.selectedDate) return;
            const dateKey = this.formatDate(this.selectedDate);
            if (!this.periodData[dateKey]) return;

            // Walk back to find start
            let start = new Date(this.selectedDate);
            while (true) {
                const prev = new Date(start);
                prev.setDate(prev.getDate() - 1);
                const prevKey = this.formatDate(prev);
                if (!this.periodData[prevKey]) break;
                start = prev;
                if (this.periodData[prevKey].isStart) break;
            }
            const startKey = this.formatDate(start);
            const periodLen = this.periodData[startKey]?.length || 5;
            for (let i = 0; i < periodLen; i++) {
                const d = new Date(start);
                d.setDate(start.getDate() + i);
                delete this.periodData[this.formatDate(d)];
            }
            await this.saveData('fema_period_data', this.periodData);
            this.hideModal('periodModal');
            this.updateCalendar();
        } catch (e) {
            console.error('Failed to delete period:', e);
            alert('Failed to delete period.');
        }
    }

    showNoteModal(date) {
        this.selectedDate = date;
        const dateLabel = document.getElementById('noteDate');
        const noteText = document.getElementById('noteText');
        if (dateLabel) dateLabel.textContent = date.toLocaleDateString();
        if (noteText) {
            const key = this.formatDate(date);
            noteText.value = this.notesData[key]?.text || '';
        }
        this.showModal('noteModal');
    }

    async saveNote() {
        const noteText = document.getElementById('noteText');
        if (!this.selectedDate || !noteText) return;
        const key = this.formatDate(this.selectedDate);
        const text = noteText.value.trim();
        if (text) {
            this.notesData[key] = { text };
        } else {
            delete this.notesData[key];
        }
        await this.saveData('fema_notes', this.notesData);
        this.hideModal('noteModal');
        this.updateCalendar();
    }

    async deleteNote() {
        if (!this.selectedDate) return;
        const key = this.formatDate(this.selectedDate);
        delete this.notesData[key];
        await this.saveData('fema_notes', this.notesData);
        this.hideModal('noteModal');
        this.updateCalendar();
    }

    showPregnancyModal(date, type) {
        this.selectedDate = date;
        this.pregnancyMode = type; // 'start' or 'birth'
        const title = document.getElementById('pregnancyModalTitle');
        const label = document.getElementById('pregnancyDateLabel');
        if (title) {
            if (type === 'start') title.textContent = 'Set Pregnancy Start';
            else title.textContent = this.pregnancyData.birthDate ? 'Edit Birth Date' : 'Set Birth Date';
        }
        if (label) label.textContent = type === 'start' ? 'Pregnancy Start Date:' : 'Birth Date:';

        this.populateDateSelectors('pregnancy', date);

        // Show current reminder if already pregnant
        const reminderBox = document.getElementById('pregnancyReminder');
        const reminderText = document.getElementById('pregnancyReminderText');
        if (reminderBox && reminderText) {
            const monthIdx = this.getPregnancyMonthIndex(date);
            if (type === 'start') {
                reminderBox.style.display = 'none';
            } else if (monthIdx > 0 && monthIdx <= 9) {
                reminderText.textContent = this.pregnancyReminders[monthIdx];
                reminderBox.style.display = 'block';
            } else {
                reminderBox.style.display = 'none';
            }
        }
        this.showModal('pregnancyModal');
    }

    getPregnancyMonthIndex(refDate) {
        if (!this.pregnancyData.startDate) return 0;
        const start = this.parseDate(this.pregnancyData.startDate);
        const endRef = refDate || new Date();
        let months = (endRef.getFullYear() - start.getFullYear()) * 12 + (endRef.getMonth() - start.getMonth());
        if (endRef.getDate() >= start.getDate()) months += 1; // round up within month
        return months;
    }

    async savePregnancy() {
        const dayEl = document.getElementById('pregnancyDay');
        const monthEl = document.getElementById('pregnancyMonth');
        const yearEl = document.getElementById('pregnancyYear');
        if (!dayEl || !monthEl || !yearEl) return;
        const d = new Date(parseInt(yearEl.value), parseInt(monthEl.value), parseInt(dayEl.value));
        const keyDate = this.formatDate(d);

        if (this.pregnancyMode === 'start') {
            // Can set pregnancy beginning at any date, except already in pregnancy
            if (this.isPregnant(d)) {
                alert('Cannot start a new pregnancy during an existing pregnancy.');
                return;
            }
            this.pregnancyData.startDate = keyDate;
            delete this.pregnancyData.birthDate;
        } else if (this.pregnancyMode === 'birth') {
            // Birth date allowed only during pregnancy period + 3 extra months
            if (!this.pregnancyData.startDate) {
                alert('Please set pregnancy start first.');
                return;
            }
            const start = this.parseDate(this.pregnancyData.startDate);
            const maxDate = new Date(start);
            maxDate.setMonth(maxDate.getMonth() + 12); // 9 months + 3 extra months
            if (d < start || d > maxDate) {
                alert('Birth date can be set only during pregnancy period + 3 months.');
                return;
            }
            this.pregnancyData.birthDate = keyDate;
        }
        await this.saveData('fema_pregnancy_data', this.pregnancyData);
        this.hideModal('pregnancyModal');
        this.updateCalendar();
    }

    showSexModal(date) {
        this.selectedDate = date;
        const key = this.formatDate(date);
        const noteEl = document.getElementById('sexNote');
        const rec = this.sexData[key];
        if (noteEl) noteEl.value = rec?.note || '';
        this.showModal('sexModal');
    }

    async saveSexActivity() {
        if (!this.selectedDate) return;
        const key = this.formatDate(this.selectedDate);
        const noteEl = document.getElementById('sexNote');
        this.sexData[key] = {
            note: noteEl ? noteEl.value.trim() : ''
        };
        await this.saveData('fema_sex_data', this.sexData);
        this.hideModal('sexModal');
        this.updateCalendar();
    }

    async deleteSexActivity() {
        if (!this.selectedDate) return;
        const key = this.formatDate(this.selectedDate);
        delete this.sexData[key];
        await this.saveData('fema_sex_data', this.sexData);
        this.hideModal('sexModal');
        this.updateCalendar();
    }

    showMedicalModal(date) {
        this.selectedDate = date;
        const key = this.formatDate(date);
        const visitType = document.getElementById('visitType');
        const notes = document.getElementById('medicalNotes');
        const hourInput = document.getElementById('medicalHour');
        const minuteInput = document.getElementById('medicalMinute');
        const hourValue = document.getElementById('medicalHourValue');
        const minuteValue = document.getElementById('medicalMinuteValue');
        
        if (visitType) visitType.value = this.gynecologistData[key]?.type || 'routine';
        if (notes) notes.value = this.gynecologistData[key]?.notes || '';
        
        // Set time values if they exist
        if (hourInput && minuteInput && hourValue && minuteValue) {
            if (this.gynecologistData[key]?.time) {
                const [hours, minutes] = this.gynecologistData[key].time.split(':');
                const hourNum = parseInt(hours) || 0;
                const minuteNum = parseInt(minutes) || 0;
                hourInput.value = hourNum;
                minuteInput.value = minuteNum;
                hourValue.textContent = hourNum;
                minuteValue.textContent = minuteNum.toString().padStart(2, '0');
            } else {
                hourInput.value = 12;
                minuteInput.value = 0;
                hourValue.textContent = '12';
                minuteValue.textContent = '00';
            }
        }
        
        this.showModal('medicalModal');
    }

    async saveMedicalVisit() {
        if (!this.selectedDate) return;
        const key = this.formatDate(this.selectedDate);
        const visitType = document.getElementById('visitType');
        const notes = document.getElementById('medicalNotes');
        const hourInput = document.getElementById('medicalHour');
        const minuteInput = document.getElementById('medicalMinute');
        
        // Format time as HH:MM if both values are provided
        let time = '';
        if (hourInput && minuteInput) {
            const hours = parseInt(hourInput.value) || 0;
            const minutes = parseInt(minuteInput.value) || 0;
            
            // Validate hours and minutes
            if (hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59) {
                time = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
            }
        }
        
        this.gynecologistData[key] = {
            type: visitType ? visitType.value : 'routine',
            notes: notes ? notes.value.trim() : '',
            time: time || undefined
        };
        await this.saveData('fema_gynecologist_data', this.gynecologistData);
        this.hideModal('medicalModal');
        this.updateCalendar();
    }

    async deleteMedicalVisit() {
        if (!this.selectedDate) return;
        const key = this.formatDate(this.selectedDate);
        delete this.gynecologistData[key];
        await this.saveData('fema_gynecologist_data', this.gynecologistData);
        this.hideModal('medicalModal');
        this.updateCalendar();
    }

    showMoodModal(date) {
        this.selectedDate = date;
        const key = this.formatDate(date);
        // Populate controls
        const mood = document.getElementById('moodSelect');
        const sleep = document.getElementById('sleepSelect');
        const weight = document.getElementById('weightInput');
        const temp = document.getElementById('tempInput');
        const entry = this.moodData[key] || {};
        if (mood && entry.mood) mood.value = entry.mood;
        if (sleep && entry.sleep) sleep.value = entry.sleep;
        if (weight && entry.weight) weight.value = entry.weight;
        if (temp && entry.temp) temp.value = entry.temp;
        this.populateSymptoms(entry.symptoms || []);
        this.showModal('moodModal');
    }

    async saveMoodData() {
        if (!this.selectedDate) return;
        const key = this.formatDate(this.selectedDate);
        const mood = document.getElementById('moodSelect')?.value || 'okay';
        const sleep = document.getElementById('sleepSelect')?.value || 'good';
        const weight = parseFloat(document.getElementById('weightInput')?.value || '');
        const temp = parseFloat(document.getElementById('tempInput')?.value || '');
        const symptoms = Array.from(document.querySelectorAll('input[name="symptoms"]:checked')).map(i => i.value);
        this.moodData[key] = { mood, sleep, weight: isNaN(weight) ? undefined : weight, temp: isNaN(temp) ? undefined : temp, symptoms };
        await this.saveData('fema_mood_data', this.moodData);
        this.hideModal('moodModal');
        this.updateCalendar();
    }

    async deleteMoodData() {
        if (!this.selectedDate) return;
        const key = this.formatDate(this.selectedDate);
        delete this.moodData[key];
        await this.saveData('fema_mood_data', this.moodData);
        this.hideModal('moodModal');
        this.updateCalendar();
    }

    showTooltip(event, date, type) {
        const tooltip = document.getElementById('tooltip');
        const content = document.getElementById('tooltipContent');
        if (!tooltip || !content) return;
        const html = this.generateTooltipContent(date, type);
        if (!html || !html.trim()) {
            this.hideTooltip();
            return;
        }
        content.innerHTML = html;
        tooltip.classList.add('show');
        const rect = event.target.getBoundingClientRect();
        tooltip.style.left = `${rect.left + window.scrollX + rect.width / 2}px`;
        tooltip.style.top = `${rect.top + window.scrollY - 8}px`;
    }

    hideTooltip() {
        const tooltip = document.getElementById('tooltip');
        if (tooltip) tooltip.classList.remove('show');
    }
    
    getMoodEmoji(mood) {
        const moodEmojis = {
            'happy': '😊',
            'sad': '😢',
            'angry': '😠',
            'anxious': '😰',
            'tired': '😴',
            'energetic': '⚡',
            'okay': '😐'
        };
        return moodEmojis[mood] || '😐';
    }

    generateTooltipContent(date, type) {
        const key = this.formatDate(date);
        const m = this.moodData[key];
        const g = this.gynecologistData[key];
        const s = this.sexData[key];
        const n = this.notesData[key];

        if (type === 'note' && n?.text) {
            const lines = [];
            lines.push(`<strong>Note</strong>`);
            lines.push(n.text);
            return lines.join('<br>');
        }
        if (type === 'mood' && m) {
            const lines = [];
            lines.push(`<strong>Mood & health</strong>`);
            lines.push(`${this.getMoodEmoji(m.mood)} ${m.mood}`);
            if (m.sleep) lines.push(`Sleep: ${m.sleep}`);
            if (m.weight) lines.push(`Weight: ${m.weight}kg`);
            if (m.temp) lines.push(`Temperature: ${m.temp}°C`);
            if (m.symptoms && m.symptoms.length > 0) {
                lines.push(`Symptoms: ${m.symptoms.join(', ')}`);
            }
            return lines.join('<br>');
        }
        if (type === 'medical' && g) {
            // Map short values to full text
            const typeMap = {
                'routine': 'Routine Checkup',
                'consultation': 'Consultation',
                'ultrasound': 'Ultrasound',
                'pap': 'Pap Smear',
                'sti': 'STI Screening',
                'prenatal': 'Prenatal Check',
                'postpartum': 'Postpartum Check',
                'mammogram': 'Mammogram Referral',
                'other': 'Other'
            };
            
            const fullType = typeMap[g.type] || g.type;
            
            // Create multiline format
            const lines = [];
            lines.push(`<strong>Gynecologist visit</strong>`);
            lines.push(fullType);
            if (g.time) lines.push(`Time: ${g.time}`);
            if (g.notes) lines.push(`Notes: ${g.notes}`);
            
            return lines.join('<br>');
        }
        if (type === 'sex' && s) {
            const lines = [];
            lines.push(`<strong>Sexual activity</strong>`);
            if (s.note) lines.push(s.note);
            return lines.join('<br>');
        }
        if (type === 'pregnancyHint' && this.getPregnancyReminderForDate) {
            const hint = this.getPregnancyReminderForDate(date);
            if (hint) return hint;
        }
        if (type === 'pregnancyHint' && this.getPregnancyReminderForDate) {
            const hint = this.getPregnancyReminderForDate(date);
            if (hint) return hint;
        }

        // Default: general content
        const parts = [];
        if (this.periodData[key]) parts.push(`Period (flow ${this.periodData[key].flow || 3}/5)`);
        if (this.isOvulationDay(date)) parts.push('Ovulation');
        if (this.isFertilityDay(date)) parts.push('Fertility window');
        if (n?.text) parts.push('Note');
        if (s) parts.push('Sexual activity');
        if (g) {
            // Map short values to full text
            const typeMap = {
                'routine': 'Routine Checkup',
                'consultation': 'Consultation',
                'ultrasound': 'Ultrasound',
                'pap': 'Pap Smear',
                'sti': 'STI Screening',
                'prenatal': 'Prenatal Check',
                'postpartum': 'Postpartum Check',
                'mammogram': 'Mammogram Referral',
                'other': 'Other'
            };
            
            const fullType = typeMap[g.type] || g.type;
            let gynText = `Gynecologist visit: ${fullType}`;
            if (g.time) gynText += ` at ${g.time}`;
            parts.push(gynText);
        }
        if (m) parts.push(`Mood: ${m.mood}, Sleep: ${m.sleep}`);
        return parts.join(' • ');
    }

    getPregnancyReminderForDate(date) {
        if (!this.pregnancyData.startDate) return null;
        const start = this.parseDate(this.pregnancyData.startDate);
        for (let k = 1; k <= 9; k++) {
            const boundary = this.addMonths(start, k - 1);
            if (this.isSameDate(this.normalizeDate(date), boundary)) {
                const base = this.pregnancyReminders[k];
                const extra = this.pregnancyExtraHints[(k - 1) % this.pregnancyExtraHints.length];
                return `${base} ${extra}`;
            }
        }
        return null;
    }

    generateYearView() {
        const grid = document.getElementById('yearGrid');
        if (!grid) return;
        grid.innerHTML = '';
        const year = this.currentYear;
        for (let m = 0; m < 12; m++) {
            const container = document.createElement('div');
            container.className = 'year-month';
            const name = document.createElement('div');
            name.className = 'year-month-name';
            name.textContent = this.getMonthName(m);

            const mini = document.createElement('div');
            mini.className = 'mini-calendar';
            const id = `yearMonthCal-${year}-${m}`;
            mini.id = id;

            container.appendChild(name);
            container.appendChild(mini);
            container.style.cursor = 'pointer';
            container.addEventListener('click', () => {
                this.currentDate = new Date(year, m, 1);
                this.showScreen('calendarScreen');
                this.updateNavigation('calendarBtn');
                this.updateCalendar();
            });
            grid.appendChild(container);

            // Populate using existing mini-calendar generator
            this.generateMiniCalendar(id, new Date(year, m, 1));
        }
    }

    /**
     * Show export format selection modal
     */
    showExportModal() {
        this.showModal('exportModal');
    }
    
    /**
     * Generate complete data for export with all requested information
     */
    generateExportData() {
        const data = {
            exportDate: new Date().toISOString(),
            pregnancyPeriods: [],
            menstrualCycles: [],
            fertilityWindows: [],
            ovulationDays: [],
            notes: [],
            moods: [],
            gynecologistVisits: [],
            sexualActivity: [],
            rawData: {
                periodData: this.periodData,
                notesData: this.notesData,
                sexData: this.sexData,
                gynecologistData: this.gynecologistData,
                moodData: this.moodData,
                pregnancyData: this.pregnancyData
            }
        };
        
        // Generate date range for comprehensive export (last 2 years)
        const endDate = new Date();
        const startDate = new Date();
        startDate.setFullYear(endDate.getFullYear() - 2);
        
        // Collect pregnancy periods
        if (this.pregnancyData.startDate) {
            const pregnancyStart = this.parseDate(this.pregnancyData.startDate);
            const pregnancyEnd = this.pregnancyData.birthDate ? 
                this.parseDate(this.pregnancyData.birthDate) : 
                this.addMonths(pregnancyStart, 9);
            
            data.pregnancyPeriods.push({
                startDate: this.pregnancyData.startDate,
                endDate: this.pregnancyData.birthDate || this.formatDate(pregnancyEnd),
                birthDate: this.pregnancyData.birthDate || null
            });
        }
        
        // Iterate through all dates to collect cycle information
        for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
            const dateKey = this.formatDate(d);
            const dateObj = new Date(d);
            
            // Menstrual days with flow intensity
            if (this.isPeriodDay(dateObj)) {
                const flow = this.getPeriodFlow(dateObj);
                data.menstrualCycles.push({
                    date: dateKey,
                    flowIntensity: flow,
                    isStart: this.periodData[dateKey]?.isStart || false
                });
            }
            
            // Fertility window days
            if (this.isFertilityDay(dateObj)) {
                data.fertilityWindows.push({
                    date: dateKey,
                    cycleDay: this.getCycleDayNumber(dateObj)
                });
            }
            
            // Ovulation days
            if (this.isOvulationDay(dateObj)) {
                data.ovulationDays.push({
                    date: dateKey,
                    cycleDay: this.getCycleDayNumber(dateObj)
                });
            }
            
            // Notes
            if (this.notesData[dateKey]) {
                data.notes.push({
                    date: dateKey,
                    text: this.notesData[dateKey].text
                });
            }
            
            // Mood data
            if (this.moodData[dateKey]) {
                const mood = this.moodData[dateKey];
                data.moods.push({
                    date: dateKey,
                    mood: mood.mood,
                    sleep: mood.sleep,
                    weight: mood.weight,
                    temperature: mood.temp,
                    symptoms: mood.symptoms || []
                });
            }
            
            // Gynecologist visits
            if (this.gynecologistData[dateKey]) {
                const visit = this.gynecologistData[dateKey];
                data.gynecologistVisits.push({
                    date: dateKey,
                    type: visit.type,
                    notes: visit.notes || ''
                });
            }
            
            // Sexual activity
            if (this.sexData[dateKey]) {
                const activity = this.sexData[dateKey];
                data.sexualActivity.push({
                    date: dateKey,
                    note: activity.note || ''
                });
            }
        }
        
        return data;
    }
    
    /**
     * Get cycle day number for a given date
     */
    getCycleDayNumber(date) {
        // Find the most recent period start before this date
        const dateStr = this.formatDate(date);
        let lastPeriodStart = null;
        
        for (const [key, data] of Object.entries(this.periodData)) {
            if (data.isStart && key <= dateStr) {
                if (!lastPeriodStart || key > lastPeriodStart) {
                    lastPeriodStart = key;
                }
            }
        }
        
        if (!lastPeriodStart) return null;
        
        const startDate = this.parseDate(lastPeriodStart);
        const diffTime = date.getTime() - startDate.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        return diffDays + 1;
    }
    
    /**
     * Export data as JSON
     */
    async exportAsJSON() {
        this.hideModal('exportModal');
        
        try {
            const data = this.generateExportData();
            const json = JSON.stringify(data, null, 2);
            const blob = new Blob([json], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `fema_export_${new Date().toISOString().slice(0,10)}.json`;
            document.body.appendChild(a);
            a.click();
            URL.revokeObjectURL(url);
            a.remove();
        } catch (error) {
            console.error('JSON export failed:', error);
            alert('Export failed. Please try again.');
        }
    }
    
    /**
     * Export data as XLSX with color-coded cells
     */
    async exportAsXLSX() {
        this.hideModal('exportModal');
        
        try {
            // Check if XLSX library is loaded
            if (typeof XLSX === 'undefined') {
                console.error('XLSX library not loaded');
                throw new Error('XLSX library not loaded');
            }
            console.log('XLSX library loaded successfully');
            console.log('XLSX version:', XLSX.version || 'version unknown');
            console.log('XLSX writeFile available:', typeof XLSX.writeFile !== 'undefined');
            console.log('XLSX utils available:', typeof XLSX.utils !== 'undefined');
            
            // Get all dates that have actual data
            const allDatesWithData = new Set([
                ...Object.keys(this.periodData),
                ...Object.keys(this.notesData),
                ...Object.keys(this.sexData),
                ...Object.keys(this.gynecologistData),
                ...Object.keys(this.moodData)
            ]);
            
            // Add pregnancy period dates if they exist
            if (this.pregnancyData.startDate) {
                const startDate = this.parseDate(this.pregnancyData.startDate);
                const endDate = this.pregnancyData.birthDate ? 
                    this.parseDate(this.pregnancyData.birthDate) : 
                    this.addMonths(startDate, 9);
                
                for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
                    allDatesWithData.add(this.formatDate(d));
                }
            }
            
            // Add fertility and ovulation dates (calculated for existing period data)
            console.log('Checking for fertility and ovulation dates...');
            const periodDates = Array.from(allDatesWithData).filter(dateStr => {
                const date = this.parseDate(dateStr);
                return this.isPeriodDay(date);
            });
            console.log('Found period dates:', periodDates);
            
            // If we have period data, add calculated fertility and ovulation dates
            if (periodDates.length > 0) {
                // For each period date, check the entire cycle (up to 35 days) for fertility/ovulation
                for (const periodDateStr of periodDates) {
                    const periodDate = this.parseDate(periodDateStr);
                    
                    // Check 35 days forward from each period date to capture full cycle
                    for (let i = 0; i <= 35; i++) {
                        const checkDate = new Date(periodDate);
                        checkDate.setDate(periodDate.getDate() + i);
                        
                        const isFert = this.isFertilityDay(checkDate);
                        const isOvul = this.isOvulationDay(checkDate);
                        
                        if (isFert || isOvul) {
                            const dateKey = this.formatDate(checkDate);
                            allDatesWithData.add(dateKey);
                            console.log('Added', isOvul ? 'ovulation' : 'fertility', 'date:', dateKey);
                        }
                    }
                    
                    // Also check 35 days backward to catch cycles that end with this period
                    for (let i = 1; i <= 35; i++) {
                        const checkDate = new Date(periodDate);
                        checkDate.setDate(periodDate.getDate() - i);
                        
                        const isFert = this.isFertilityDay(checkDate);
                        const isOvul = this.isOvulationDay(checkDate);
                        
                        if (isFert || isOvul) {
                            const dateKey = this.formatDate(checkDate);
                            allDatesWithData.add(dateKey);
                            console.log('Added', isOvul ? 'ovulation' : 'fertility', 'date:', dateKey);
                        }
                    }
                }
            } else {
                console.log('No period data found - cannot calculate fertility/ovulation');
            }
            
            // Sort dates
            const sortedDates = Array.from(allDatesWithData).sort();
            
            // Create worksheet data
            const wsData = [];
            
            // Headers
            wsData.push([
                'Date',
                'Cycle & Pregnancy Status',
                'Period Active',
                'Flow Intensity',
                'Cycle Day',
                'Notes',
                'Mood',
                'Sleep Quality',
                'Weight (kg)',
                'Temperature (°C)',
                'Symptoms',
                'Gynecologist Visit',
                'Visit Notes',
                'Sexual Activity',
                'Activity Notes'
            ]);
            
            // Process each date with data
            for (const dateKey of sortedDates) {
                const dateObj = this.parseDate(dateKey);
                
                // Determine day type and collect all data
                const isPeriod = this.isPeriodDay(dateObj);
                const isFertility = this.isFertilityDay(dateObj);
                const isOvulation = this.isOvulationDay(dateObj);
                const isBirth = this.isBirthDate(dateObj);
                const pregnancyState = this.getPregnancyState(dateObj);
                const isPregnancy = pregnancyState.state === 'pregnancy-day';
                const isOverdue = pregnancyState.state === 'pregnancy-overdue-day';
                
                const period = this.periodData[dateKey];
                const note = this.notesData[dateKey];
                const mood = this.moodData[dateKey];
                const gynVisit = this.gynecologistData[dateKey];
                const sexActivity = this.sexData[dateKey];
                
                let cyclePregnancyStatus = '';
                
                if (isBirth) {
                    cyclePregnancyStatus = 'Birth Date';
                } else if (isOverdue) {
                    cyclePregnancyStatus = 'Pregnancy (Overdue)';
                } else if (isPregnancy) {
                    cyclePregnancyStatus = 'Pregnancy';
                } else if (isPeriod) {
                    cyclePregnancyStatus = 'Period';
                } else if (isOvulation) {
                    cyclePregnancyStatus = 'Ovulation';
                } else if (isFertility) {
                    cyclePregnancyStatus = 'Fertility Window';
                }
                
                wsData.push([
                    dateKey,
                    cyclePregnancyStatus,
                    isPeriod ? 'Yes' : '',
                    isPeriod ? (period?.flow || 3) : '',
                    this.getCycleDayNumber(dateObj) || '',
                    note?.text || '',
                    mood?.mood || '',
                    mood?.sleep || '',
                    mood?.weight || '',
                    mood?.temp || '',
                    mood?.symptoms ? mood.symptoms.join('; ') : '',
                    gynVisit?.type || '',
                    gynVisit?.notes || '',
                    sexActivity ? 'Yes' : '',
                    sexActivity?.note || ''
                ]);
            }
            
            // Create workbook and worksheet
            const wb = XLSX.utils.book_new();
            const ws = XLSX.utils.aoa_to_sheet(wsData);
            
            console.log('Worksheet created with', wsData.length, 'rows');
            console.log('Worksheet range:', ws['!ref']);
            
            // Set column widths
            ws['!cols'] = [
                { width: 12 }, // Date
                { width: 20 }, // Cycle & Pregnancy Status
                { width: 12 }, // Period Active
                { width: 12 }, // Flow Intensity
                { width: 10 }, // Cycle Day
                { width: 30 }, // Notes
                { width: 12 }, // Mood
                { width: 12 }, // Sleep Quality
                { width: 12 }, // Weight
                { width: 15 }, // Temperature
                { width: 25 }, // Symptoms
                { width: 18 }, // Gynecologist Visit
                { width: 25 }, // Visit Notes
                { width: 15 }, // Sexual Activity
                { width: 20 }  // Activity Notes
            ];
            
            // Add worksheet to workbook
            XLSX.utils.book_append_sheet(wb, ws, 'FEMA Health Data');
            console.log('Worksheet added to workbook');
            
            // Generate and download XLSX file
            console.log('Generating XLSX file...');
            const wbout = XLSX.write(wb, { 
                bookType: 'xlsx', 
                type: 'array'
            });
            
            console.log('XLSX file generated, size:', wbout.length, 'bytes');
            
            const blob = new Blob([wbout], { 
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
            });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            const filename = `fema_export_${new Date().toISOString().slice(0,10)}.xlsx`;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            URL.revokeObjectURL(url);
            a.remove();
            
            console.log('XLSX file downloaded:', filename);
            alert(`Data exported successfully as ${filename}!`);
            
        } catch (error) {
            console.error('XLSX export failed:', error);
            console.log('Falling back to CSV export...');
            
            try {
                // Fallback: Export as CSV with the same data structure
                const allDatesWithData = new Set([
                    ...Object.keys(this.periodData),
                    ...Object.keys(this.notesData),
                    ...Object.keys(this.sexData),
                    ...Object.keys(this.gynecologistData),
                    ...Object.keys(this.moodData)
                ]);
                
                // Add pregnancy period dates if they exist
                if (this.pregnancyData.startDate) {
                    const startDate = this.parseDate(this.pregnancyData.startDate);
                    const endDate = this.pregnancyData.birthDate ? 
                        this.parseDate(this.pregnancyData.birthDate) : 
                        this.addMonths(startDate, 9);
                    
                    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
                        allDatesWithData.add(this.formatDate(d));
                    }
                }
                
                // Add fertility and ovulation dates for CSV fallback
                const periodDates = Array.from(allDatesWithData).filter(dateStr => {
                    const date = this.parseDate(dateStr);
                    return this.isPeriodDay(date);
                });
                
                for (const periodDateStr of periodDates) {
                    const periodDate = this.parseDate(periodDateStr);
                    
                    // Check 35 days forward and backward for fertility/ovulation
                    for (let i = -35; i <= 35; i++) {
                        const checkDate = new Date(periodDate);
                        checkDate.setDate(periodDate.getDate() + i);
                        
                        if (this.isFertilityDay(checkDate) || this.isOvulationDay(checkDate)) {
                            allDatesWithData.add(this.formatDate(checkDate));
                        }
                    }
                }
                
                const sortedDates = Array.from(allDatesWithData).sort();
                const rows = [];
                
                // Headers
                rows.push([
                    'Date',
                    'Cycle & Pregnancy Status',
                    'Period Active',
                    'Flow Intensity',
                    'Cycle Day',
                    'Notes',
                    'Mood',
                    'Sleep Quality',
                    'Weight (kg)',
                    'Temperature (°C)',
                    'Symptoms',
                    'Gynecologist Visit',
                    'Visit Notes',
                    'Sexual Activity',
                    'Activity Notes'
                ]);
                
                // Data rows
                for (const dateKey of sortedDates) {
                    const dateObj = this.parseDate(dateKey);
                    const isPeriod = this.isPeriodDay(dateObj);
                    const isFertility = this.isFertilityDay(dateObj);
                    const isOvulation = this.isOvulationDay(dateObj);
                    const isBirth = this.isBirthDate(dateObj);
                    const pregnancyState = this.getPregnancyState(dateObj);
                    const isPregnancy = pregnancyState.state === 'pregnancy-day';
                    
                    const period = this.periodData[dateKey];
                    const note = this.notesData[dateKey];
                    const mood = this.moodData[dateKey];
                    const gynVisit = this.gynecologistData[dateKey];
                    const sexActivity = this.sexData[dateKey];
                    
                    let cyclePregnancyStatus = '';
                    
                    if (isBirth) {
                        cyclePregnancyStatus = 'Birth Date';
                    } else if (isPregnancy) {
                        cyclePregnancyStatus = 'Pregnancy';
                    } else if (isPeriod) {
                        cyclePregnancyStatus = 'Period';
                    } else if (isOvulation) {
                        cyclePregnancyStatus = 'Ovulation';
                    } else if (isFertility) {
                        cyclePregnancyStatus = 'Fertility Window';
                    }
                    
                    rows.push([
                        dateKey,
                        cyclePregnancyStatus,
                        isPeriod ? 'Yes' : '',
                        isPeriod ? (period?.flow || 3) : '',
                        this.getCycleDayNumber(dateObj) || '',
                        note?.text || '',
                        mood?.mood || '',
                        mood?.sleep || '',
                        mood?.weight || '',
                        mood?.temp || '',
                        mood?.symptoms ? mood.symptoms.join('; ') : '',
                        gynVisit?.type || '',
                        gynVisit?.notes || '',
                        sexActivity ? 'Yes' : '',
                        sexActivity?.note || ''
                    ]);
                }
                
                // Convert to CSV
                const csv = rows.map(row => 
                    row.map(cell => `"${(cell || '').toString().replace(/"/g, '""')}"`).join(',')
                ).join('\n');
                
                const blob = new Blob([csv], { type: 'text/csv' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `fema_export_${new Date().toISOString().slice(0,10)}.csv`;
                document.body.appendChild(a);
                a.click();
                URL.revokeObjectURL(url);
                a.remove();
                
                alert('XLSX export failed, but data was exported as CSV successfully.');
                
            } catch (csvError) {
                console.error('CSV fallback also failed:', csvError);
                alert('Export failed completely. Please try again.');
            }
        }
    }

    async loadProducts() {
        // Load main products for the products tab
        await this.loadMainProducts();
        // Load recommended products for the articles tab
        await this.loadRecommendedProducts();
    }

    async loadMainProducts() {
        // Retry mechanism for loading products
        let retries = 5; // Increased retries
        while (retries > 0) {
            try {
                // Always fetch the latest revision URL from the gist API to ensure we get the most current version
                console.log('Fetching latest gist revision info...');
                const gistInfo = await httpClient.getJSON('https://api.github.com/gists/17cfba71d7e31d1ca9a651516bcecc15');
                
                let url = 'https://gist.githubusercontent.com/P-H-V/17cfba71d7e31d1ca9a651516bcecc15/raw/products.xml';
                
                const files = gistInfo.files || {};
                const productsFile = files['products.xml'];
                if (productsFile && productsFile.raw_url) {
                    url = productsFile.raw_url;
                    console.log('Using latest revision URL:', url);
                } else {
                    // Fallback to the default URL pattern with the commit hash from the gist
                    if (gistInfo.history && gistInfo.history.length > 0) {
                        const latestCommit = gistInfo.history[0].version;
                        url = `https://gist.githubusercontent.com/P-H-V/17cfba71d7e31d1ca9a651516bcecc15/raw/${latestCommit}/products.xml`;
                        console.log('Using URL with latest commit hash:', url);
                    }
                }
                
                console.log('Fetching products from:', url);
                const xmlText = await httpClient.getText(url);
                
                console.log('Received XML response, length:', xmlText.length);
                
                // Check if response is valid XML
                if (!xmlText.trim().startsWith('<?xml') && !xmlText.trim().startsWith('<rss')) {
                    throw new Error('Invalid XML response received');
                }
                
                const doc = new DOMParser().parseFromString(xmlText, 'application/xml');
                
                // Check for parsing errors
                const parserError = doc.querySelector('parsererror');
                if (parserError) {
                    throw new Error('XML parsing error: ' + parserError.textContent);
                }
                
                const items = [...doc.querySelectorAll('item')];
                
                // Create product items
                const newProductItems = items.map(item => {
                    const get = sel => item.querySelector(sel)?.textContent?.trim() || '';
                    const title = get('title');
                    const link = get('link');
                    const desc = get('description');
                    const guid = get('guid');
                    const price = get('price');
                    const pubDate = new Date(get('pubDate') || Date.now());
                    
                    let img = '';
                    const enclosure = item.querySelector('enclosure');
                    if (enclosure) {
                        img = enclosure.getAttribute('url') || '';
                    }
                    
                    return {
                        title,
                        link,
                        pubDate,
                        desc,
                        img,
                        guid,
                        price,
                        isProduct: true
                    };
                });
                
                // Always update the product items to ensure we have the latest data
                // This ensures we follow the "Force Fresh Data Load" specification
                console.log('Product data updated with latest revision, updating...');
                this.productItems = newProductItems;
                
                // Log specific product info for debugging
                const targetProduct = this.productItems.find(p => p.guid === 'amazon-1756940753930-vub7lx63d');
                if (targetProduct) {
                    console.log('Target product details:', {
                        title: targetProduct.title,
                        price: targetProduct.price,
                        guid: targetProduct.guid
                    });
                } else {
                    console.log('Target product not found in loaded data');
                }
                
                console.log(`Loaded ${this.productItems.length} products`);
                return; // Success, exit the retry loop
            } catch (e) {
                console.error(`Failed to load products (retries left: ${retries - 1}):`, e);
                retries--;
                if (retries === 0) {
                    this.productItems = [];
                    return;
                }
                // Wait a bit before retrying, with exponential backoff
                const waitTime = 1500 * (6 - retries); // Increasing wait time
                console.log(`Waiting ${waitTime}ms before retry...`);
                await new Promise(resolve => setTimeout(resolve, waitTime));
            }
        }
    }

    async loadRecommendedProducts() {
        // Load recommended products from the new gist URL for articles tab
        let retries = 5; // Increased retries
        while (retries > 0) {
            try {
                // Always fetch the latest revision URL from the gist API to ensure we get the most current version
                console.log('Fetching latest gist revision info for recommended products...');
                const gistInfo = await httpClient.getJSON('https://api.github.com/gists/4260f440057fe6e92f72f0cedea36853');
                
                let url = 'https://gist.githubusercontent.com/P-H-V/4260f440057fe6e92f72f0cedea36853/raw/recommended_products.xml';
                
                const files = gistInfo.files || {};
                const productsFile = files['recommended_products.xml'];
                if (productsFile && productsFile.raw_url) {
                    url = productsFile.raw_url;
                    console.log('Using latest revision URL for recommended products:', url);
                } else {
                    // Fallback to the default URL pattern with the commit hash from the gist
                    if (gistInfo.history && gistInfo.history.length > 0) {
                        const latestCommit = gistInfo.history[0].version;
                        url = `https://gist.githubusercontent.com/P-H-V/4260f440057fe6e92f72f0cedea36853/raw/${latestCommit}/recommended_products.xml`;
                        console.log('Using URL with latest commit hash for recommended products:', url);
                    }
                }
                
                console.log('Fetching recommended products from:', url);
                const xmlText = await httpClient.getText(url);
                
                console.log('Received XML response for recommended products, length:', xmlText.length);
                
                // Check if response is valid XML
                if (!xmlText.trim().startsWith('<?xml') && !xmlText.trim().startsWith('<rss')) {
                    throw new Error('Invalid XML response received for recommended products');
                }
                
                const doc = new DOMParser().parseFromString(xmlText, 'application/xml');
                
                // Check for parsing errors
                const parserError = doc.querySelector('parsererror');
                if (parserError) {
                    throw new Error('XML parsing error for recommended products: ' + parserError.textContent);
                }
                
                const items = [...doc.querySelectorAll('item')];
                
                // Create recommended product items
                const newRecommendedProductItems = items.map(item => {
                    const get = sel => item.querySelector(sel)?.textContent?.trim() || '';
                    const title = get('title');
                    const link = get('link');
                    const desc = get('description');
                    const guid = get('guid');
                    const price = get('price');
                    const pubDate = new Date(get('pubDate') || Date.now());
                    
                    let img = '';
                    const enclosure = item.querySelector('enclosure');
                    if (enclosure) {
                        img = enclosure.getAttribute('url') || '';
                    }
                    
                    return {
                        title,
                        link,
                        pubDate,
                        desc,
                        img,
                        guid,
                        price,
                        isProduct: true
                    };
                });
                
                // Always update the recommended product items to ensure we have the latest data
                console.log('Recommended product data updated with latest revision, updating...');
                this.recommendedProductItems = newRecommendedProductItems;
                
                console.log(`Loaded ${this.recommendedProductItems.length} recommended products`);
                return; // Success, exit the retry loop
            } catch (e) {
                console.error(`Failed to load recommended products (retries left: ${retries - 1}):`, e);
                retries--;
                if (retries === 0) {
                    this.recommendedProductItems = [];
                    return;
                }
                // Wait a bit before retrying, with exponential backoff
                const waitTime = 1500 * (6 - retries); // Increasing wait time
                console.log(`Waiting ${waitTime}ms before retry for recommended products...`);
                await new Promise(resolve => setTimeout(resolve, waitTime));
            }
        }
    }

    async initArticles() {
        console.log('Initializing articles screen');
        
        // Show loading indicator
        const loadingIndicator = document.getElementById('articlesLoading');
        const grid = document.getElementById('articlesGrid');
        if (loadingIndicator && grid) {
            loadingIndicator.style.display = 'block';
            grid.style.display = 'none';
        }
        
        // Always fetch fresh RSS data to ensure latest content
        console.log('Fetching RSS feeds');
        await this.fetchRssFeeds();
        
        // Always fetch fresh product data to ensure we have the latest from the gist
        console.log('Loading products from gist');
        await this.loadProducts();
        console.log('Products loaded, count:', this.productItems ? this.productItems.length : 0);
        
        this.rssRenderedCount = 0;
        if (grid) {
            grid.innerHTML = '';
            // Initialize Masonry if not already initialized
            if (this.masonryInstance) {
                this.masonryInstance.destroy();
            }
            this.initMasonry();
        }
        
        // Hide loading indicator and show grid
        if (loadingIndicator && grid) {
            loadingIndicator.style.display = 'none';
            grid.style.display = 'block';
        }
        
        // Small delay to ensure DOM is ready
        setTimeout(() => {
            console.log('Rendering articles');
            this.renderMoreArticles();
        }, 10);
    }

    async fetchRssFeeds() {
        const urls = [
            'https://blogs.womans.org/feed/',
            'https://www.healthista.com/feed/'
        ];
        try {
            await this.loadBlockedTerms();
            const results = await Promise.all(urls.map(u => this.fetchViaBackground(u)));
            const items = [];
            results.forEach((xml, idx) => {
                const doc = new DOMParser().parseFromString(xml, 'application/xml');
                const isAtom = doc.querySelector('feed') && !doc.querySelector('rss');
                const nodes = isAtom ? [...doc.querySelectorAll('entry')] : [...doc.querySelectorAll('item')];
                nodes.forEach(n => {
                    const get = sel => n.querySelector(sel)?.textContent?.trim() || '';
                    let title = get(isAtom ? 'title' : 'title');
                    let link = isAtom ? (n.querySelector('link[rel="alternate"]')?.getAttribute('href') || n.querySelector('link')?.getAttribute('href') || '') : get('link');
                    let dateStr = get(isAtom ? 'updated' : 'pubDate') || get('dc\\:date');
                    let pubDate = dateStr ? new Date(dateStr) : new Date();
                    let descHtml = get('description') || get('content') || get('content\\:encoded') || '';
                    let desc = this.stripHtml(descHtml);
                    // Try enclosure and media namespaced tags via getElementsByTagName
                    let img = '';
                    const enc = n.getElementsByTagName('enclosure')[0];
                    if (enc) img = enc.getAttribute('url') || '';
                    if (!img) {
                        const mthumb = n.getElementsByTagName('media:thumbnail')[0] || n.getElementsByTagName('media\:thumbnail')[0];
                        if (mthumb) img = mthumb.getAttribute('url') || '';
                    }
                    if (!img) {
                        const mcont = n.getElementsByTagName('media:content')[0] || n.getElementsByTagName('media\:content')[0];
                        if (mcont) img = mcont.getAttribute('url') || '';
                    }
                    if (!img && /<img/i.test(descHtml)) {
                        const tmp = document.createElement('div');
                        tmp.innerHTML = descHtml;
                        const imgtag = tmp.querySelector('img');
                        if (imgtag) img = imgtag.getAttribute('src') || '';
                    }
                    // Resolve relative URLs against feed origin
                    const base = urls[idx];
                    if (img) img = this.resolveUrl(base, img);
                    if (link) link = this.resolveUrl(base, link);
                    const summary = (desc || '').slice(0, 220) + (desc && desc.length > 220 ? '…' : '');
                    items.push({ title, link, pubDate, desc: summary, img, raw: `${title} ${desc} ${descHtml}` });
                });
            });
            items.sort((a,b) => b.pubDate - a.pubDate);
            this.rssItems = items.filter(i => !this.shouldHideArticle(i));
        } catch (e) {
            console.error('RSS fetch failed', e);
            this.rssItems = [];
        }
    }

    async fetchViaBackground(url) {
        return new Promise((resolve, reject) => {
            chrome.runtime.sendMessage({ type: 'fetchRss', url }, (resp) => {
                if (chrome.runtime.lastError) {
                    reject(chrome.runtime.lastError);
                    return;
                }
                if (resp && resp.ok) resolve(resp.text);
                else reject(new Error(resp?.error || 'Fetch failed'));
            });
        });
    }

    stripHtml(html) {
        const d = document.createElement('div');
        d.innerHTML = html || '';
        return d.textContent || d.innerText || '';
    }

    resolveUrl(base, url) {
        try { return new URL(url, base).toString(); } catch { return url; }
    }

    async loadBlockedTerms() {
        if (this.blockedTerms && Array.isArray(this.blockedTerms)) return;
        try {
            const resp = await fetch(chrome.runtime.getURL('blocked_words.txt'));
            const text = await resp.text();
            this.blockedTerms = text.split(/[,\n]/).map(s => s.trim().toLowerCase()).filter(Boolean);
        } catch (e) {
            console.warn('Failed to load blocked terms');
            this.blockedTerms = [];
        }
    }

    normalizeText(s) {
        try { return (s || '').toString().toLowerCase().normalize('NFKD').replace(/\p{Diacritic}/gu, ''); } catch { return (s || '').toString().toLowerCase(); }
    }

    shouldHideArticle(item) {
        const hay = this.normalizeText(`${item.title} ${item.desc} ${item.raw || ''}`);
        return (this.blockedTerms || []).some(term => hay.includes(term));
    }

    initMasonry() {
        const grid = document.getElementById('articlesGrid');
        if (!grid || typeof Masonry === 'undefined') return;
        
        this.masonryInstance = new Masonry(grid, {
            itemSelector: '.article-card, .product-card',
            columnWidth: 220,
            gutter: 20,
            fitWidth: true,
            transitionDuration: 0.3
        });
    }
    
    updateMasonryLayout() {
        if (this.masonryInstance) {
            // Wait for images to load before laying out
            setTimeout(() => {
                this.masonryInstance.layout();
            }, 100);
        }
    }

    renderMoreArticles() {
        const grid = document.getElementById('articlesGrid');
        const content = document.getElementById('articleContent');
        if (!grid || !content) return;
        content.style.display = 'none';
        const pageSize = 6;
        const start = this.rssRenderedCount || 0;
        const slice = (this.rssItems || []).slice(start, start + pageSize);
        
        // Debug information
        console.log('Rendering articles:', {
            rssItemsCount: this.rssItems ? this.rssItems.length : 0,
            productItemsCount: this.productItems ? this.productItems.length : 0,
            recommendedProductItemsCount: this.recommendedProductItems ? this.recommendedProductItems.length : 0,
            rssRenderedCount: this.rssRenderedCount,
            start: start,
            sliceLength: slice.length
        });
        
        const newElements = [];
        
        slice.forEach((item, index) => {
            // Insert recommended product every 8th position (positions 7, 15, 23, etc. - 0-based)
            const globalPosition = start + index;
            if (globalPosition > 0 && (globalPosition + 1) % 8 === 0 && this.recommendedProductItems && this.recommendedProductItems.length > 0) {
                // Insert a recommended product card
                const productIndex = Math.floor(globalPosition / 8) % this.recommendedProductItems.length;
                console.log(`Inserting recommended product at position ${globalPosition}, using product index ${productIndex} of ${this.recommendedProductItems.length}`);
                const product = this.recommendedProductItems[productIndex];
                const productCard = this.createProductCard(product);
                grid.appendChild(productCard);
                newElements.push(productCard);
            }
            
            // Create regular article card
            const card = this.createArticleCard(item);
            grid.appendChild(card);
            newElements.push(card);
        });
        
        // Add new elements to masonry and update layout
        if (this.masonryInstance && newElements.length > 0) {
            this.masonryInstance.appended(newElements);
            this.updateMasonryLayout();
        }
        
        this.rssRenderedCount = start + slice.length;
        console.log('Updated rssRenderedCount to:', this.rssRenderedCount);
    }
    
    createArticleCard(item) {
        const card = document.createElement('div');
        card.className = 'article-card';
        const imgSrc = item.img ? this.resolveUrl(item.link || '', item.img) : 'fema-logo.png';
        
        // Create image element with fixed dimensions to prevent layout shifts
        const img = document.createElement('img');
        img.className = 'article-thumbnail';
        img.style.width = '100%';
        img.style.height = '100px';
        img.style.objectFit = 'cover';
        img.src = imgSrc;
        img.alt = 'Fema article image';
        img.onerror = function() {
            this.onerror = null;
            this.src = 'fema-logo.png';
        };
        
        // Handle image load for masonry layout update
        img.onload = () => {
            this.updateMasonryLayout();
        };
        
        const title = document.createElement('h3');
        title.className = 'article-title';
        title.textContent = item.title;
        
        const summary = document.createElement('p');
        summary.className = 'article-summary';
        summary.textContent = item.desc;
        
        const source = document.createElement('div');
        source.className = 'article-source';
        const host = this.safeHost(item.link);
        source.innerHTML = `Read on <a href="${item.link}" target="_blank" rel="noopener">${host}</a>`;
        
        // Append elements to maintain proper structure
        card.appendChild(img);
        card.appendChild(title);
        card.appendChild(summary);
        card.appendChild(source);
        
        return card;
    }
    
    createProductCard(product) {
        console.log('Creating product card for:', product.title);
        const card = document.createElement('div');
        card.className = 'product-card article-card'; // Include article-card for masonry
        
        // Create image element
        const img = document.createElement('img');
        img.className = 'product-image';
        img.style.width = '100%';
        img.style.height = '120px';
        img.style.objectFit = 'cover';
        img.src = product.img || 'fema-logo.png';
        img.alt = product.title;
        img.onerror = function() {
            this.onerror = null;
            this.src = 'fema-logo.png';
        };
        
        // Handle image load for masonry layout update
        img.onload = () => {
            this.updateMasonryLayout();
        };
        
        const title = document.createElement('h3');
        title.className = 'product-title';
        title.textContent = product.title;
        
        // Add price display
        const price = document.createElement('div');
        price.className = 'product-price';
        price.textContent = product.price || '';
        
        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'product-actions';
        
        const shopButton = document.createElement('a');
        shopButton.href = product.link;
        shopButton.target = '_blank';
        shopButton.rel = 'noopener';
        shopButton.className = 'product-button';
        shopButton.textContent = 'Shop Now';
        
        buttonContainer.appendChild(shopButton);
        
        // Product badge
        const badge = document.createElement('div');
        badge.className = 'product-badge';
        badge.textContent = 'Recommended Product';
        
        card.appendChild(badge);
        card.appendChild(img);
        card.appendChild(title);
        card.appendChild(price);
        card.appendChild(buttonContainer);
        
        return card;
    }

    loadMoreArticles() {
        this.renderMoreArticles();
    }

    safeHost(url) {
        try { return new URL(url).hostname; } catch { return 'source'; }
    }

    attachArticlesScroll() {
        const container = document.querySelector('#articlesScreen .articles-container');
        if (!container || this._articlesScrollAttached) return;
        this._articlesScrollAttached = true;
        container.addEventListener('scroll', () => {
            const nearBottom = container.scrollTop + container.clientHeight >= container.scrollHeight - 50;
            if (nearBottom) {
                // Check if there are more articles to load
                if (this.rssItems && this.rssRenderedCount < this.rssItems.length) {
                    this.loadMoreArticles();
                }
            }
        });
    }

    showArticle(article) {
        const grid = document.getElementById('articlesGrid');
        const content = document.getElementById('articleContent');
        if (!grid || !content) return;
        grid.innerHTML = '';
        content.style.display = 'block';
        content.innerHTML = `
            <button class="action-btn secondary" id="backToArticles">← Back</button>
            <div class="article-full">${article.content}</div>
        `;
        document.getElementById('backToArticles').addEventListener('click', () => this.showArticlesList());
    }

    showArticlesList() {
        this.generateArticles();
    }

    async initProducts() {
        console.log('Initializing products screen');
        
        // Show loading indicator
        const loadingIndicator = document.getElementById('productsLoading');
        const grid = document.getElementById('productsGrid');
        if (loadingIndicator && grid) {
            loadingIndicator.style.display = 'block';
            grid.style.display = 'none';
        }
        
        // Load products if not already loaded
        if (this.productItems.length === 0) {
            console.log('Loading products from gist');
            await this.loadProducts();
        }
        
        if (grid) {
            grid.innerHTML = '';
            // Initialize Masonry if not already initialized
            if (this.productsMasonryInstance) {
                this.productsMasonryInstance.destroy();
            }
            this.initProductsMasonry();
        }
        
        // Hide loading indicator and show grid
        if (loadingIndicator && grid) {
            loadingIndicator.style.display = 'none';
            grid.style.display = 'block';
        }
        
        // Small delay to ensure DOM is ready
        setTimeout(() => {
            console.log('Rendering products');
            this.renderAllProducts();
        }, 10);
    }

    initProductsMasonry() {
        const grid = document.getElementById('productsGrid');
        if (!grid || typeof Masonry === 'undefined') return;
        
        this.productsMasonryInstance = new Masonry(grid, {
            itemSelector: '.product-card-no-badge',
            columnWidth: 220,
            gutter: 20,
            fitWidth: true,
            transitionDuration: 0.3
        });
    }
    
    renderAllProducts() {
        const grid = document.getElementById('productsGrid');
        if (!grid) return;
        
        const newElements = [];
        
        // Render all products without the "Recommended Product" badge and red border
        this.productItems.forEach(product => {
            const productCard = this.createProductCardWithoutBadge(product);
            grid.appendChild(productCard);
            newElements.push(productCard);
        });
        
        // Add new elements to masonry and update layout
        if (this.productsMasonryInstance && newElements.length > 0) {
            this.productsMasonryInstance.appended(newElements);
            this.updateProductsMasonryLayout();
        }
    }
    
    updateProductsMasonryLayout() {
        if (this.productsMasonryInstance) {
            // Wait for images to load before laying out
            setTimeout(() => {
                this.productsMasonryInstance.layout();
            }, 100);
        }
    }

    createProductCardWithoutBadge(product) {
        console.log('Creating product card without badge for:', product.title);
        const card = document.createElement('div');
        card.className = 'product-card-no-badge'; // Use the new class without badge and red border
        
        // Create image element
        const img = document.createElement('img');
        img.className = 'product-image';
        img.style.width = '100%';
        img.style.height = '120px';
        img.style.objectFit = 'cover';
        img.src = product.img || 'fema-logo.png';
        img.alt = product.title;
        img.onerror = function() {
            this.onerror = null;
            this.src = 'fema-logo.png';
        };
        
        // Handle image load for masonry layout update
        img.onload = () => {
            this.updateProductsMasonryLayout();
        };
        
        const title = document.createElement('h3');
        title.className = 'product-title';
        title.textContent = product.title;
        
        // Add price display
        const price = document.createElement('div');
        price.className = 'product-price';
        price.textContent = product.price || '';
        
        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'product-actions';
        
        buttonContainer.appendChild(shopButton);
        
        card.appendChild(img);
        card.appendChild(title);
        card.appendChild(price);
        card.appendChild(buttonContainer);
        
        return card;
    }
}

// Initialize the application when DOM is loaded
let app;
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM Content Loaded, initializing app...');
    app = new FemaPeriodTracker();
    console.log('App initialized:', app);
    
    // Make app globally accessible for mobile menu
    window.app = app;
});

// Also initialize on Cordova deviceready event
document.addEventListener('deviceready', function() {
    console.log('Cordova deviceready event fired');
    if (!app) {
        console.log('Initializing app on deviceready');
        app = new FemaPeriodTracker();
        window.app = app;
    }
}, false);

