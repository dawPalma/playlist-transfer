"use client";

import CookieConsent from "react-cookie-consent";

const CookieConsentBanner = () => {
  return (
    <CookieConsent
      location="bottom"
      buttonText="I understand"
      cookieName="user-cookie-consent"
      style={{ background: "#1a202c", color: "#a0aec0" }}
      buttonStyle={{ color: "#ffffff", background: "#4f46e5", fontSize: "14px", borderRadius: "5px" }}
      expires={150}
    >
      This website uses cookies to enhance the user experience. We use a cookie to manage your login session.
    </CookieConsent>
  );
};

export default CookieConsentBanner;
