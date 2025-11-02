import React, { useEffect, useState } from "react";

// Inline styles (replaces GovID.css)
const inlineStyles = `
.govid-container {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  color: #333;
  background: none;
  position: relative;
}

.govid-header-title-static {
  position: sticky;
  top: 0;
  background: linear-gradient(135deg, #e0a02a 0%, #ffe595 100%);
  color: white;
  font-size: 24px;
  font-weight: 600;
  padding: 20px;
  text-align: center;
  z-index: 100;
}

.govid-banner-sticky {
  margin-bottom: 10px;
}

.govid-back-arrow {
  cursor: pointer;
  font-size: 16px;
  font-weight: 500;
}

.govid-banner-qld-logo {
  height: 30px;
  width: auto;
}

.govid-card {
  background: white;
  margin: 20px;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.govid-card-row {
  display: flex;
  margin-bottom: 20px;
}

.govid-photo-wrapper {
  margin-right: 15px;
  cursor: pointer;
}

.govid-photo {
  width: 80px;
  height: 100px;
  border-radius: 8px;
  object-fit: cover;
  border: 2px solid #ddd;
}

.govid-photo-placeholder {
  width: 80px;
  height: 100px;
  border-radius: 8px;
  background: #f0f0f0;
  border: 2px solid #ddd;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
  font-size: 12px;
}

.govid-info {
  flex: 1;
}

.govid-name-main {
  margin-bottom: 10px;
}

.govid-name-text {
  font-size: 18px;
  font-weight: 600;
  display: block;
}

.govid-name-last {
  font-size: 18px;
  font-weight: 600;
  display: block;
}

.govid-info-label {
  font-size: 12px;
  color: #666;
  margin-bottom: 2px;
}

.govid-bold {
  font-weight: 600;
}

.govid-value-left {
  text-align: left;
}

.govid-licence-row {
  margin: 10px 0 5px 0;
}

.govid-copy-icon {
  margin-left: 5px;
  cursor: pointer;
  opacity: 0.7;
}

.govid-refreshed {
  margin: 15px 0;
  font-size: 12px;
  color: #666;
}

.govid-refreshed-label {
  display: block;
  margin-bottom: 2px;
}

.govid-refreshed-value {
  font-weight: 500;
}

.govid-divider {
  height: 1px;
  background: #eee;
  margin: 15px 0;
}

.govid-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 12px 0;
}

.govid-label {
  font-size: 14px;
  color: #666;
  font-weight: 500;
}

.govid-value {
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.govid-status-badge {
  background: #28a745;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
}

.govid-age-badge {
  display: flex;
  align-items: center;
  gap: 8px;
}

.govid-age-icon {
  color: #28a745;
}

.govid-age-text {
  font-weight: 500;
}

.govid-car-icon {
  margin-left: 8px;
  color: #666;
}

.govid-row-address {
  align-items: flex-start;
}

.govid-sublabel {
  font-size: 11px;
  color: #999;
  font-style: italic;
}

.govid-value-address {
  text-align: right;
  line-height: 1.4;
  font-size: 13px;
}

.govid-row-signature {
  align-items: center;
}

.govid-signature {
  height: 30px;
  width: auto;
  max-width: 100px;
}

.govid-row-country {
  align-items: flex-start;
  line-height: 1.4;
}

.govid-share-btn {
  background: #e0a02a;
  color: white;
  border: none;
  padding: 15px 30px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 16px;
  cursor: pointer;
  width: 90%;
  max-width: 350px;
}

.govid-share-btn:hover {
  background: #d49520;
}

.govid-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.govid-expanded-image {
  max-width: 90%;
  max-height: 90%;
  border-radius: 8px;
}
`;

// Placeholder base64 images
const backgroundImage = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIiBvcGFjaXR5PSIwLjEiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSIjOTk5IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+QmFja2dyb3VuZDwvdGV4dD48L3N2Zz4=";

const qldLogo = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjMwIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiNmZmYiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEwIiBmaWxsPSIjMzMzIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+UUxEIEdvdjwvdGV4dD48L3N2Zz4=";

const signatures = [
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjMwIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxwYXRoIGQ9Ik0xMCwyMCBRMzAsMTAgNTAsMTUgVDkwLDIwIiBzdHJva2U9IiMzMzMiIHN0cm9rZS13aWR0aD0iMiIgZmlsbD0ibm9uZSIvPjwvc3ZnPg==",
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjMwIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxwYXRoIGQ9Ik0xNSwyNSBRNDAsMTAgNjUsMjAgVDkwLDE1IiBzdHJva2U9IiMzMzMiIHN0cm9rZS13aWR0aD0iMiIgZmlsbD0ibm9uZSIvPjwvc3ZnPg==",
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjMwIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxwYXRoIGQ9Ik0yMCwxNSBRNTAsMjUgODAsMTAiIHN0cm9rZT0iIzMzMyIgc3Ryb2tlLXdpZHRoPSIyIiBmaWxsPSJub25lIi8+PC9zdmc+",
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjMwIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxwYXRoIGQ9Ik0xMCwxOCBRMzUsMjUgNjAsMTIgVDkwLDIyIiBzdHJva2U9IiMzMzMiIHN0cm9rZS13aWR0aD0iMiIgZmlsbD0ibm9uZSIvPjwvc3ZnPg==",
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjMwIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxwYXRoIGQ9Ik0yNSwyMCBRNTAsMTAgNzUsMjIiIHN0cm9rZT0iIzMzMyIgc3Ryb2tlLXdpZHRoPSIyIiBmaWxsPSJub25lIi8+PC9zdmc+"
];

// Inline icon components (replace external dependencies)
const CopyIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
  </svg>
);

const InfoIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
  </svg>
);

const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="#28a745">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
  </svg>
);

const CarIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11C5.84 5 5.28 5.42 5.08 6.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
  </svg>
);

// Simple PullToRefresh replacement
const SimplePullToRefresh = ({ children, onRefresh, ...props }) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const handleRefresh = async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    if (onRefresh) await onRefresh();
    setIsRefreshing(false);
  };

  return (
    <div {...props} onTouchStart={handleRefresh}>
      {children}
    </div>
  );
};

// Simple motion replacement
const SimpleMotion = ({ children, animate, transition, ...props }) => {
  return <div {...props}>{children}</div>;
};

// Theme color functions
const setThemeColor = (color) => {
  let metaTheme = document.querySelector("meta[name=theme-color]");
  if (!metaTheme) {
    metaTheme = document.createElement("meta");
    metaTheme.name = "theme-color";
    document.head.appendChild(metaTheme);
  }
  metaTheme.setAttribute("content", color);
};

const resetThemeColor = () => setThemeColor("#ffffff");

const months = {
  1: 'Jan', 2: 'Feb', 3: 'Mar', 4: 'Apr', 5: 'May', 6: 'Jun',
  7: 'Jul', 8: 'Aug', 9: 'Sep', 10: 'Oct', 11: 'Nov', 12: 'Dec'
};

const DEFAULT_USER = {
  firstName: 'Jane',
  middleName: 'A.',
  lastName: 'Doe',
  photo: '',
  day: '01',
  month: 1,
  age: 30,
  houseNumber: '10',
  street: 'Example St',
  type: '',
  suburb: 'Brisbane',
  postCode: '4000',
  country: 'AU',
  state: 'QLD'
};

function calculateYearOfBirth(age, birthMonth, birthDay) {
  const now = new Date();
  const birthDate = new Date(now.getFullYear(), birthMonth - 1, birthDay);
  if (now < birthDate) {
    return now.getFullYear() - age - 1;
  }
  return now.getFullYear() - age;
}

function getCurrentTime() {
  const now = new Date();
  const day = now.getDate().toString().padStart(2, '0');
  const month = now.toLocaleString('en-US', { month: 'short' });
  const year = now.getFullYear();
  const hours = now.getHours();
  const minutes = now.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'pm' : 'am';
  const formattedHours = hours % 12 || 12;
  return `${day} ${month} ${year} ${formattedHours}:${minutes}${ampm}`;
}

export default function GovIDPreview({ previewUser = DEFAULT_USER, onBack }) {
  const [lastRefreshed, setLastRefreshed] = useState(getCurrentTime());
  const [licenseNum, setLicenseNum] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [signature, setSignature] = useState(null);
  const [isImageExpanded, setIsImageExpanded] = useState(false);

  useEffect(() => {
    // Inject inline styles
    const styleSheet = document.createElement("style");
    styleSheet.textContent = inlineStyles;
    document.head.appendChild(styleSheet);

    // preview-specific theme and body background; restore on unmount
    const prevBodyBg = document.body.style.background || '';
    setThemeColor('#e0a02a');
    document.body.style.background = 'linear-gradient(135deg, #e0a02a 0%, #ffe595 100%)';

    // generate preview details
    generateLicenseNum();
    generateExpiryDate();
    generateCardNumber();
    pickSignature();

    return () => {
      resetThemeColor();
      document.body.style.background = prevBodyBg;
      // Remove injected styles
      if (styleSheet.parentNode) {
        styleSheet.parentNode.removeChild(styleSheet);
      }
    };
  }, []);

  function generateLicenseNum() {
    let num = '';
    for (let i = 0; i < 9; i++) num += Math.floor(Math.random() * 10).toString();
    setLicenseNum(num);
  }

  function generateExpiryDate() {
    const currentYear = new Date().getFullYear();
    const randomDay = Math.floor(Math.random() * 28) + 1;
    const randomMonth = Math.floor(Math.random() * 12) + 1;
    const expiryYear = currentYear + 3;
    setExpiryDate(`${randomDay} ${months[randomMonth]} ${expiryYear}`);
  }

  function generateCardNumber() {
    const c = Math.random().toString(36).slice(-10).toUpperCase();
    setCardNumber(c);
  }

  function pickSignature() {
    setSignature(signatures[Math.floor(Math.random() * signatures.length)]);
  }

  const safeUpperCase = (text) => (text || '').toUpperCase();
  const toggleImageExpansion = () => setIsImageExpanded(!isImageExpanded);

  return (
    <>
      <SimpleMotion
        animate={{ scale: [1, 1.08, 1] }}
        transition={{ duration: 1.5, repeat: Infinity, repeatType: 'loop', ease: 'easeInOut' }}
      >
        <img
          src={backgroundImage}
          alt=""
          aria-hidden="true"
          style={{
            position: 'fixed',
            top: 100,
            left: 100,
            width: '50vw',
            height: '50vh',
            objectFit: 'contain',
            transformOrigin: 'center',
            opacity: 0.1,
            zIndex: 1,
            pointerEvents: 'none'
          }}
        />
      </SimpleMotion>

      <SimplePullToRefresh onRefresh={() => new Promise(r => setTimeout(() => { setLastRefreshed(getCurrentTime()); r(); }, 400))} style={{ height: '100vh' }}>
        <div className="govid-container" style={{ minHeight: '100vh', paddingBottom: '120px', background: 'none' }}>
          <div className="govid-header-title-static">
            <div className="govid-banner-sticky" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span className="govid-back-arrow" onClick={() => onBack && onBack() }>
                Back
              </span>
              <img src={qldLogo} alt="Queensland Government" className="govid-banner-qld-logo" style={{ pointerEvents: 'none' }} />
            </div>
            Driver Licence
          </div>

          <div className="govid-card">
            <div className="govid-card-row">
              {previewUser?.photo ? (
                <div className="govid-photo-wrapper" onClick={toggleImageExpansion}>
                  <img src={previewUser.photo} alt=" " className="govid-photo" />
                </div>
              ) : (
                <div className="govid-photo-placeholder" />
              )}

              <div className="govid-info">
                <div className="govid-name-main">
                  <span className="govid-name-text">{safeUpperCase(previewUser.firstName)} {safeUpperCase(previewUser.middleName)}</span>
                  <span className="govid-name-last">{safeUpperCase(previewUser.lastName)}</span>
                </div>

                <div className="govid-info-label">DoB</div>
                <div className="govid-bold govid-value-left" style={{ letterSpacing: '1px', fontWeight: 600 }}>
                  {previewUser.day} {months[previewUser.month]} {calculateYearOfBirth(previewUser.age, previewUser.month, previewUser.day)}
                </div>

                <div className="govid-licence-row">
                  <span className="govid-info-label"><u>Licence No.</u> <CopyIcon className="govid-copy-icon govid-value-left" /></span>
                </div>
                <div className="govid-bold govid-value-left" style={{ letterSpacing: '1px', fontWeight: 600 }}>{licenseNum}</div>
              </div>
            </div>

            {isImageExpanded && previewUser.photo && (
              <div className="govid-overlay" onClick={toggleImageExpansion} style={{ background: 'rgba(0,0,0,0.4)' }}>
                <img className="govid-expanded-image" src={previewUser.photo} alt="Expanded" />
              </div>
            )}

            <div className="govid-refreshed">
              <span className="govid-refreshed-label">Information was refreshed online:</span>
              <span className="govid-refreshed-value">{lastRefreshed}</span>
            </div>

            <div className="govid-divider" />

            <div className="govid-row">
              <span className="govid-label"><u>Status</u> <InfoIcon style={{ fontSize: 14, verticalAlign: -1 }} /></span>
              <span className="govid-status-badge">Current</span>
            </div>

            <div className="govid-divider" />

            <div className="govid-row">
              <span className="govid-label">Age</span>
              <span className="govid-age-badge">
                <CheckIcon className="govid-age-icon" style={{ color: '#2e9170' }} />
                <span className="govid-age-text govid-value-left">Over 18</span>
              </span>
            </div>

            <div className="govid-divider" />

            <div className="govid-row impo">
              <span className="govid-label"><u>Class</u> <InfoIcon style={{ fontSize: 14, verticalAlign: -1 }} /></span>
              <span className="govid-value" style={{ flex: 1 }}>(C) Car <CarIcon className="govid-car-icon" /></span>
            </div>

            <div className="govid-row impo">
              <span className="govid-label">Type</span>
              <span className="govid-value">(P1) Provisional</span>
            </div>

            <div className="govid-row impo">
              <span className="govid-label">Expiry</span>
              <span className="govid-value">{expiryDate}</span>
            </div>

            <div className="govid-divider" />

            <div className="govid-row">
              <span className="govid-label"><u>Conditions</u> <InfoIcon style={{ fontSize: 14, verticalAlign: -1 }} /></span>
              <span className="govid-value">-</span>
            </div>

            <div className="govid-divider" />

            <div className="govid-row govid-row-address">
              <div>
                <span className="govid-label">Address</span>
                <span className="govid-sublabel">Are your details<br /> up to date?</span>
              </div>
              <span className="govid-value-address" style={{ paddingLeft: '40px' }}>
                {safeUpperCase(previewUser.houseNumber)} {safeUpperCase(previewUser.street)} {safeUpperCase(previewUser.type)}
                <br />
                {safeUpperCase(previewUser.suburb)}
                <br />
                QLD {safeUpperCase(previewUser.postCode)}
                <br />
                AU
              </span>
            </div>

            <div className="govid-divider" />

            <div className="govid-row">
              <span className="govid-label"><u>Card number</u> <CopyIcon className="govid-copy-icon govid-value-left" /></span>
              <span className="govid-value">{cardNumber}</span>
            </div>

            <div className="govid-divider" />

            <div className="govid-row govid-row-signature">
              <span className="govid-label">Signature</span>
              <span>
                {signature && <img className="govid-signature" src={signature} alt="Signature" style={{ pointerEvents: 'none' }} />}
              </span>
            </div>

            <div className="govid-divider" />

            <div className="govid-row govid-row-country">
              <div>
                <span className="govid-label">Issuing Country</span>
                <br />
                <span className="govid-label">Issuing Authority</span>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span className="govid-value">AU</span>
                <br />
                <span className="govid-value">Queensland Government<br/>Department of Transport<br/>and Main Roads</span>
              </div>
            </div>
          </div>
        </div>
      </SimplePullToRefresh>

      <div className="govid-share-btn-sticky-wrapper" style={{ position: 'fixed', left: 0, right: 0, bottom: 'env(safe-area-inset-bottom, 0px)', width: '100%', zIndex: 9999, margin: 0, padding: '10px 5px', display: 'flex', justifyContent: 'center' }}>
        <button className="govid-share-btn" onClick={() => alert('Share preview')}>SHARE DRIVERS LICENSE</button>
      </div>
    </>
  );
}
