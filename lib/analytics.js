// lib/analytics.js
const trackEvent = (eventName, parameters = {}) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, parameters);
  }
};

export const analytics = {
  signupStarted: () => {
    trackEvent('signup_started', {
      event_category: 'conversion',
      event_label: 'signup_flow'
    });
  },

  signupCompleted: (method = 'email') => {
    trackEvent('signup_completed', {
      event_category: 'conversion',
      event_label: 'signup_success',
      method: method
    });
  },

  loginSuccess: (method = 'email') => {
    trackEvent('login', {
      event_category: 'engagement',
      method: method
    });
  },

  dashboardViewed: () => {
    trackEvent('dashboard_view', {
      event_category: 'engagement',
      event_label: 'main_dashboard'
    });
  },

  patientAdded: () => {
    trackEvent('patient_added', {
      event_category: 'core_feature',
      event_label: 'patient_management'
    });
  },

  sessionScheduled: () => {
    trackEvent('session_scheduled', {
      event_category: 'core_feature',
      event_label: 'scheduling'
    });
  },

  ctaClicked: (ctaName) => {
    trackEvent('cta_click', {
      event_category: 'interest',
      event_label: ctaName
    });
  },

  privacyViewed: () => {
    trackEvent('privacy_viewed', {
      event_category: 'legal',
      event_label: 'privacy_policy'
    });
  },

  termsViewed: () => {
    trackEvent('terms_viewed', {
      event_category: 'legal',
      event_label: 'terms_service'
    });
  }
}; 