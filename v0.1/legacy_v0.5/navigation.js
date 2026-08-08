/**
 * Navigation and State Management for SoulAgent Demo
 */

const State = {
    // SYSTEM 1: THE LOBSTER
    lobster: {
        type: null,
        stage: 'Baby',
        attributes: {
            rational: 10,
            empathy: 10,
            humor: 5,
            execution: 15,
            initiative: 5
        }
    },
    // SYSTEM 2: DIGITAL TWIN
    twin: {
        syncProgress: 0,
        unlocked: false,
        memoryNodes: []
    }
};

function navigateTo(url) {
    // Add a simple transition effect before navigating
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.3s ease';
    
    setTimeout(() => {
        window.location.href = url;
    }, 300);
}

// Global initialization
document.addEventListener('DOMContentLoaded', () => {
    console.log('SoulAgent Demo Initialized');
    
    // Auto fade-in
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.5s ease';
    requestAnimationFrame(() => {
        document.body.style.opacity = '1';
    });
});
