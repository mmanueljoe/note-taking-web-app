import { getElementByType } from './utils.js';

const initializeSettings = () => {
    const elements = {
        settingsSection: getElementByType('class', 'settings-section'),
        backBtn: getElementByType('class', 'back-btn'),
        settingsNav: getElementByType('class', 'settings-nav'),
        settingsNavItemLink: getElementByType('class', 'nav-item-link'),
        appMainContainer: getElementByType('class', 'app-main-container'),
        colorThemeBtn: getElementByType('class', 'color-theme-btn'),
        fontThemeBtn: getElementByType('class', 'font-theme-btn'),
        changePasswordBtn: getElementByType('class', 'change-password-btn'),
    }


    const handleViewportChange = () => {
        const hasActiveSection = elements.settingsSection.some(section => section.classList.contains('is-active'));

        if(window.innerWidth < 1024){
            if(hasActiveSection){
                elements.appMainContainer[0].classList.add('settings-section-open');
            } else {
                elements.appMainContainer[0].classList.remove('settings-section-open');
            }
        }else{
            elements.appMainContainer[0].classList.remove('settings-section-open');
        }
    }

    // helper function: set active section
    const setActiveSection = (sectionId) => {
        // remove active class from all nav links
        elements.settingsNavItemLink.forEach(item => {
            item.classList.remove('is-active');
        });

        // remove active class from all sections
        elements.settingsSection.forEach(section => {
            section.classList.remove('is-active');
        });

        // find the clicked link
        const clickedLink = elements.settingsNavItemLink.find(link => {
            const href = link.getAttribute('href');
            return href === `#${sectionId}`;
        });

        if(clickedLink){
            clickedLink.classList.add('is-active');
        }

        // add active to matching section
        const targetSection = elements.settingsSection.find(section => {
            const id = section.getAttribute('id');
            return id === sectionId;
        });

        // add active class to matching section
        if (targetSection) {
            targetSection.classList.add('is-active');
        }

        // on mobile: hide nav and show content
        if(window.innerWidth < 1024){
            elements.appMainContainer[0].classList.add('settings-section-open');
        }

        handleViewportChange();
       
    }


    // handle back button clicks (mobile/tablet only) // handle back button clicks (mobile/tablet only)
        elements.backBtn.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
               
                // remove active class from all sections
                elements.settingsSection.forEach(section => {
                        section.classList.remove('is-active');
                    }
                );


                // remove active class from all nav links
                elements.settingsNavItemLink.forEach(item => {
                    item.classList.remove('is-active');
                });

                elements.appMainContainer[0].classList.remove('settings-section-open');

                handleViewportChange();
            });
        });

    // handle nav link clicks
    elements.settingsNavItemLink.forEach(link => {
       link.addEventListener('click', (e) => {
        e.preventDefault();

        const sectionId = link.getAttribute('href').split('#')[1];
        setActiveSection(sectionId);
       });
    });

    // handle viewport change
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(handleViewportChange, 50);
    });

    setActiveSection('color-theme-settings');
    handleViewportChange();


    // handle color theme button clicks
    // if(colorThemeBtn){
    //     colorThemeBtn.addEventListener('click', (e) => {
    //         e.preventDefault();
    //         const selectedTheme = document.querySelector('input[name="color-theme"]:checked').value;
    //         if(selectedTheme){
    //             // applyTheme(selectedTheme.id);
    //             // saveSettings({colorTheme: selectedTheme.id}); // save settings to localStorage
    //         }
    //     })
    // }

    // handle font theme button clicks
    // if(fontThemeBtn){
    //     fontThemeBtn.addEventListener('click', (e) => {
    //         e.preventDefault();
    //         const selectedFont = document.querySelector('input[name="font-theme"]:checked').value;
    //         if(selectedFont){
    //             applyFont(selectedFont.id);
    //         }
    //     })
    // }

}

if(document.querySelector('.settings-section')){
    initializeSettings();
}

