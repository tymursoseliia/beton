/* ==========================================================================
   KYIV BETON - INTERACTIVE APPLICATION LOGIC
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

    /* --- 1. Mobile Navigation Toggle --- */
    const mobileToggle = document.getElementById('mobileToggle');
    const navMenu = document.getElementById('navMenu');

    if (mobileToggle && navMenu) {
        mobileToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            const icon = mobileToggle.querySelector('i');
            if (navMenu.classList.contains('active')) {
                icon.className = 'fa-solid fa-xmark';
            } else {
                icon.className = 'fa-solid fa-bars';
            }
        });

        navMenu.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                if (mobileToggle.querySelector('i')) {
                    mobileToggle.querySelector('i').className = 'fa-solid fa-bars';
                }
            });
        });
    }

    /* --- 2. Concrete Catalog Filters --- */
    const filterButtons = document.querySelectorAll('.catalog-filters .filter-btn');
    const catalogCards = document.querySelectorAll('.catalog-grid .catalog-card');

    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filterValue = btn.getAttribute('data-filter');

            catalogCards.forEach(card => {
                if (filterValue === 'all' || card.getAttribute('data-category') === filterValue) {
                    card.style.display = 'flex';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });

    /* --- 3. Robust Interactive Concrete Calculator --- */
    const calcTypeButtons = document.querySelectorAll('.calc-type-btn');
    const calcFieldsContainer = document.getElementById('calcFields');
    const calcGradeSelect = document.getElementById('calcGradeSelect');
    const calcMarginSelect = document.getElementById('calcMarginSelect');
    const calcNeedPump = document.getElementById('calcNeedPump');
    const calcRunBtn = document.getElementById('calcRunBtn');

    const resVolume = document.getElementById('resVolume');
    const resGrade = document.getElementById('resGrade');
    const resTrucks = document.getElementById('resTrucks');
    const resPumpStatus = document.getElementById('resPumpStatus');
    const resTotalPrice = document.getElementById('resTotalPrice');
    const btnOrderCalc = document.getElementById('btnOrderCalc');

    let activeCalcType = 'slab';

    const calcFieldsConfig = {
        slab: [
            { id: 'length', label: 'Довжина плити (м)', placeholder: '10', default: 10 },
            { id: 'width', label: 'Ширина плити (м)', placeholder: '8', default: 8 },
            { id: 'thickness', label: 'Товщина плити (м)', placeholder: '0.2', default: 0.2 }
        ],
        strip: [
            { id: 'length', label: 'Загальна довжина стрічки (м)', placeholder: '40', default: 40 },
            { id: 'width', label: 'Ширина стрічки (м)', placeholder: '0.4', default: 0.4 },
            { id: 'depth', label: 'Глибина / Висота (м)', placeholder: '1.2', default: 1.2 }
        ],
        columns: [
            { id: 'diameter', label: 'Діаметр або сторона (м)', placeholder: '0.3', default: 0.3 },
            { id: 'height', label: 'Висота колони / палі (м)', placeholder: '3', default: 3 },
            { id: 'count', label: 'Кількість колоній / паль (шт)', placeholder: '12', default: 12 }
        ],
        custom: [
            { id: 'custom_vol', label: 'Необхідний об'єм (м³)', placeholder: '25', default: 25 }
        ]
    };

    function renderCalcFields(type) {
        activeCalcType = type;
        const fields = calcFieldsConfig[type];
        calcFieldsContainer.innerHTML = '';

        fields.forEach(field => {
            const div = document.createElement('div');
            div.className = 'calc-field';
            div.innerHTML = `
                <label for="input_${field.id}">${field.label}</label>
                <input type="number" step="0.01" min="0" id="input_${field.id}" value="${field.default}" placeholder="${field.placeholder}">
            `;
            calcFieldsContainer.appendChild(div);
        });

        calcFieldsContainer.querySelectorAll('input').forEach(input => {
            input.addEventListener('input', calculateConcreteVolume);
            input.addEventListener('keyup', calculateConcreteVolume);
            input.addEventListener('change', calculateConcreteVolume);
        });

        calculateConcreteVolume();
    }

    calcTypeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            calcTypeButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderCalcFields(btn.getAttribute('data-type'));
        });
    });

    function calculateConcreteVolume() {
        let baseVolume = 0;

        if (activeCalcType === 'slab') {
            const l = parseFloat(document.getElementById('input_length')?.value) || 0;
            const w = parseFloat(document.getElementById('input_width')?.value) || 0;
            const t = parseFloat(document.getElementById('input_thickness')?.value) || 0;
            baseVolume = l * w * t;
        } else if (activeCalcType === 'strip') {
            const l = parseFloat(document.getElementById('input_length')?.value) || 0;
            const w = parseFloat(document.getElementById('input_width')?.value) || 0;
            const d = parseFloat(document.getElementById('input_depth')?.value) || 0;
            baseVolume = l * w * d;
        } else if (activeCalcType === 'columns') {
            const size = parseFloat(document.getElementById('input_diameter')?.value) || 0;
            const h = parseFloat(document.getElementById('input_height')?.value) || 0;
            const count = parseFloat(document.getElementById('input_count')?.value) || 0;
            baseVolume = (Math.PI * Math.pow(size / 2, 2)) * h * count;
        } else if (activeCalcType === 'custom') {
            baseVolume = parseFloat(document.getElementById('input_custom_vol')?.value) || 0;
        }

        const marginRate = parseFloat(calcMarginSelect ? calcMarginSelect.value : 0.05) || 0;
        const totalVol = baseVolume * (1 + marginRate);
        const roundedVol = totalVol.toFixed(2);

        const selectedOption = calcGradeSelect ? calcGradeSelect.options[calcGradeSelect.selectedIndex] : null;

        // Mixer Truck count (average 9 m³)
        const trucks = totalVol > 0 ? Math.ceil(totalVol / 9) : 0;

        // Pump requirement status
        const isPumpNeeded = calcNeedPump ? calcNeedPump.checked : false;

        // Update output elements
        if (resVolume) resVolume.textContent = `${roundedVol} м³`;
        if (resGrade) resGrade.textContent = selectedOption ? selectedOption.value : 'М300 (В22,5)';
        if (resTrucks) resTrucks.textContent = `${trucks} авто (по 9 м³)`;
        if (resPumpStatus) resPumpStatus.textContent = isPumpNeeded ? 'Автобетононасос (включено)' : 'Не обрано';
        if (resTotalPrice) resTotalPrice.textContent = 'Ціна зі знижкою від заводу';
    }

    if (calcGradeSelect) calcGradeSelect.addEventListener('change', calculateConcreteVolume);
    if (calcMarginSelect) calcMarginSelect.addEventListener('change', calculateConcreteVolume);
    if (calcNeedPump) calcNeedPump.addEventListener('change', calculateConcreteVolume);
    if (calcRunBtn) calcRunBtn.addEventListener('click', calculateConcreteVolume);

    renderCalcFields('slab');

    if (btnOrderCalc) {
        btnOrderCalc.addEventListener('click', () => {
            const vol = resVolume ? resVolume.textContent : '16.80 м³';
            const grade = calcGradeSelect ? calcGradeSelect.value : 'М300';
            openOrderModalWithProduct(`Бетон ${grade} — ${vol}`);
        });
    }

    /* --- 4. Modal Window Management System --- */
    const modalOverlays = document.querySelectorAll('.modal-overlay');

    document.addEventListener('click', (e) => {
        const trigger = e.target.closest('[data-modal]');
        if (trigger) {
            e.preventDefault();
            const modalId = trigger.getAttribute('data-modal');
            const targetModal = document.getElementById(modalId);

            if (modalId === 'modal-order') {
                const gradeTitle = trigger.getAttribute('data-grade-title') || 'Бетон М300 (В22,5)';
                openOrderModalWithProduct(gradeTitle);
            } else if (targetModal) {
                openModal(targetModal);
            }
            return;
        }

        const closeBtn = e.target.closest('.modal-close');
        if (closeBtn) {
            closeAllModals();
        }
    });

    modalOverlays.forEach(overlay => {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                closeAllModals();
            }
        });
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeAllModals();
        }
    });

    function openModal(modalEl) {
        closeAllModals();
        if (modalEl) {
            modalEl.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }

    window.closeAllModals = function() {
        modalOverlays.forEach(m => m.classList.remove('active'));
        document.body.style.overflow = '';
    };

    function openOrderModalWithProduct(productTitle) {
        const modalOrder = document.getElementById('modal-order');
        const modalOrderProductTitle = document.getElementById('modalOrderProductTitle');
        const modalSelectedProduct = document.getElementById('modalSelectedProduct');

        if (modalOrderProductTitle) modalOrderProductTitle.textContent = productTitle;
        if (modalSelectedProduct) modalSelectedProduct.value = productTitle;

        openModal(modalOrder);
    }

    /* --- 5. Form Submissions --- */
    const heroQuickForm = document.getElementById('heroQuickForm');
    const orderForm = document.getElementById('orderForm');
    const callbackForm = document.getElementById('callbackForm');
    const pumpForm = document.getElementById('pumpForm');
    const modalSuccess = document.getElementById('modal-success');

    [heroQuickForm, orderForm, callbackForm, pumpForm].forEach(form => {
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                form.reset();
                closeAllModals();
                openModal(modalSuccess);
            });
        }
    });

    /* --- 6. FAQ Accordion --- */
    const faqQuestions = document.querySelectorAll('.faq-question');
    faqQuestions.forEach(questionBtn => {
        questionBtn.addEventListener('click', () => {
            const parentItem = questionBtn.closest('.faq-item');
            const isActive = parentItem.classList.contains('active');

            document.querySelectorAll('.faq-item').forEach(item => {
                item.classList.remove('active');
            });

            if (!isActive) {
                parentItem.classList.add('active');
            }
        });
    });

});
