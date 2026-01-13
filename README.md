# nFKs Payment Gateway

A modern, feature-rich payment gateway built with Next.js, offering multiple payment methods with a premium user interface and smooth animations.

![Next.js](https://img.shields.io/badge/Next.js-15.1.4-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)

## 🚀 Features

### 💳 Multiple Payment Methods

<img width="1710" height="988" alt="image" src="https://github.com/user-attachments/assets/b16e32ac-3485-4db5-bbd0-b3bfe756d348" />


#### 1. **Credit/Debit Card**

<img width="1710" height="990" alt="image" src="https://github.com/user-attachments/assets/b3157779-7ead-4433-ba88-3ba2861f9818" />

- Real-time card number formatting with spacing
- Interactive 3D card preview with animations
- CVV security with masked input
- Expiry date validation (MM/YY format)
- Support for Visa, Mastercard, and other major cards
- Chip and contactless payment indicators

#### 2. **UPI / QR Code**

<img width="1710" height="975" alt="image" src="https://github.com/user-attachments/assets/8f63042e-bf6e-471d-9867-85571ca16364" />


- Dynamic QR code for instant payments
- Support for multiple UPI apps:
  - Google Pay (GPay)
  - PhonePe
  - Paytm
  - Apple Pay
  - Super.money
- Manual UPI ID entry option
- Interactive app selection with hover effects

#### 3. **Net Banking**

<img width="1710" height="984" alt="image" src="https://github.com/user-attachments/assets/6466241a-a2b4-4f40-bf9d-431a55886616" />


- **Custom Dropdown Component** with premium UI
- **Country Selection** with flag icons:
  - India 🇮🇳
  - United States 🇺🇸
  - United Kingdom 🇬🇧
  - Canada 🇨🇦
  - Australia 🇦🇺
  - Singapore 🇸🇬
- **Bank Selection** with 12+ supported banks:
  - HDFC Bank
  - ICICI Bank
  - State Bank of India (SBI)
  - Axis Bank
  - Kotak Mahindra Bank
  - Punjab National Bank (PNB)
  - Bank of Baroda (BOB)
  - Yes Bank
  - Union Bank of India
  - Bank of America
  - Deutsche Bank
  - Standard Bank
- Bank server connection error handling
- Visual feedback with checkmarks for selected options

#### 4. **Wallet Payment**

<img width="1710" height="991" alt="image" src="https://github.com/user-attachments/assets/cb040a1d-4290-4c79-831a-e9ed1c197ee8" />


- nFKs Wallet integration
- Real-time balance display
- Cashback and rewards points tracking
- Insufficient balance validation
- Secret reference ID for demo (use `iluvmayank` for ₹10,000 balance)

### 🎨 UI/UX Features

#### Custom Dropdown Component
- **Modern Design**: Glassmorphism effects with smooth animations
- **Smart Layout**: Text → Checkmark → Icon arrangement
- **Visual Feedback**: 
  - Green checkmark (✓) next to selected items
  - Hover effects with background color transitions
  - Slide-down animation on open
- **Icon Support**: 
  - Country flags from `/logos/country/`
  - Bank logos from `/logos/bank/`
  - Flexible sizing (small/normal)
- **Accessibility**: Click-outside-to-close functionality

#### Lottie Animations
- **Wallet Animation**: Displayed during wallet payment selection
- **QR Animation**: Shown for UPI payment method
- **Bank Animation**: Displayed for net banking
- **Card Success Animation**: Processing animation for card payments
- **Processing Animation**: Generic processing indicator
- **Success Animation**: Payment success celebration
- **Failed Animation**: Payment failure indication

#### Notification System

<img width="1710" height="1006" alt="image" src="https://github.com/user-attachments/assets/a515adf4-a431-43f2-84e9-a4a49179e509" />


- **Toast Notifications** with NotificationBar component
- **Error Handling**:
  - Insufficient wallet balance
  - Bank server connection failures
  - Payment processing errors
- **Success Messages**: Payment confirmation
- **Auto-dismiss**: 4-5 second timeout
- **Type-based Styling**: Success (green) and Error (red) variants

### 🎫 Order Summary Ticket
- **Ticket-style UI** with perforated edges
- **Dynamic Information**:
  - Company name with logo indicator
  - Order number
  - Product details
  - VAT (included in price)
  - Total amount with currency
- **Floating Elements**: Method-specific animations and cards
- **Responsive Design**: Adapts to different payment methods

### 🔄 Payment Flow States
1. **Method Selection**: Grid view of all payment options
2. **Details Entry**: Method-specific form inputs
3. **Processing**: Animated loading state with Lottie
4. **Success**: Celebration animation with return to merchant
5. **Failed**: Error state with retry option

## 🛠️ Tech Stack

- **Framework**: Next.js 15.1.4 (App Router)
- **Language**: TypeScript 5
- **UI Library**: React 19
- **Animations**: Lottie-react
- **Styling**: CSS Modules with custom properties
- **Fonts**: Geist Sans & Geist Mono
- **Image Optimization**: Next.js Image component
- **Icons**: Custom SVG icons and bank/country logos

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- npm, yarn, pnpm, or bun

### Setup

1. **Clone the repository**
```bash
git clone https://github.com/the-mayankjha/nFKs-Payments.git
cd nFKs-Payments
```

2. **Install dependencies**
```bash
npm install
# or
yarn install
# or
pnpm install
```

3. **Run the development server**
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

4. **Open your browser**
Navigate to [http://localhost:3000](http://localhost:3000)

## 🎯 Usage

### Query Parameters
You can customize the payment page using URL parameters:

```
http://localhost:3000?amount=549.99&currency=USD&orderId=1266201&product=MacBook%20Air&name=John%20Doe
```

**Supported Parameters:**
- `amount`: Payment amount (default: 549.99)
- `currency`: Currency code (default: USD)
- `orderId`: Order ID (default: 1266201)
- `product`: Product name (default: MacBook Air)
- `name`: Customer name (default: John Doe)

### Demo Features

#### Test Wallet Balance
- Use reference ID: `iluvmayank` to get ₹10,000 wallet balance

#### Test Payment Failure
- Enter name as `fail` or `failed` to simulate payment failure

#### Test Bank Connection Error
- Select any bank in Net Banking and click "Proceed"
- Error notification will appear: "Connect to {Bank Name} server failed. Please use other Payment Method."

## 📁 Project Structure

```
payments/
├── public/
│   ├── logos/
│   │   ├── bank/          # Bank logos (HDFC, ICICI, SBI, etc.)
│   │   ├── country/       # Country flag icons
│   │   ├── flags/         # Alternative flag icons
│   │   ├── gpay.svg
│   │   ├── phonepe.svg
│   │   └── ...
│   ├── lottie/            # Lottie animation files
│   ├── chip.png
│   ├── qr.jpeg
│   └── nfks_logo.png
├── src/
│   ├── app/
│   │   ├── page.tsx       # Main payment page
│   │   ├── layout.tsx     # Root layout
│   │   └── globals.css    # Global styles
│   ├── assets/
│   │   └── lottie/        # Lottie JSON files
│   └── components/
│       ├── CustomDropdown.tsx    # Reusable dropdown component
│       └── NotificationBar.tsx   # Toast notification component
└── README.md
```

## 🎨 Component Documentation

### CustomDropdown

A highly customizable dropdown component with icon support and visual feedback.

**Props:**
```typescript
interface CustomDropdownProps {
  options: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
}

interface DropdownOption {
  value: string;
  label: string;
  icon?: string;           // Text icon (emoji or character)
  iconUrl?: string;        // Image URL for icon
  size?: 'small' | 'normal'; // Icon size
}
```

**Features:**
- Checkmark indicator for selected items
- Icon support (text or image)
- Smooth animations
- Click-outside-to-close
- Hover effects
- Customizable sizing

### NotificationBar

Toast notification component for user feedback.

**Props:**
```typescript
interface NotificationBarProps {
  show: boolean;
  title: string;
  message: string;
  type?: 'success' | 'error';
  onClose: () => void;
}
```

## 🔧 Configuration

### Adding New Banks

Edit `src/app/page.tsx` and add to the bank options array:

```typescript
{ 
  value: 'BANK_CODE', 
  label: 'Bank Name', 
  iconUrl: '/logos/bank/bank-logo.svg',
  size: 'small' // optional
}
```

### Adding New Countries

Add to the country options array:

```typescript
{ 
  value: 'Country Name', 
  label: 'Country Name', 
  iconUrl: '/logos/country/country-flag.svg' 
}
```

## 🚀 Deployment

### Deploy on Vercel

The easiest way to deploy is using the [Vercel Platform](https://vercel.com/new):

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/the-mayankjha/nFKs-Payments)

### Build for Production

```bash
npm run build
npm start
```

## 📝 Recent Updates

### Latest Features (January 2026)
- ✅ Added Net Banking payment method with 12+ banks
- ✅ Implemented custom dropdown component with premium UI
- ✅ Added country selection with flag icons
- ✅ Integrated bank server connection error handling
- ✅ Repositioned checkmark next to text in dropdowns
- ✅ Updated icon paths to use `/logos/country/` directory
- ✅ Enhanced notification system with dynamic bank names
- ✅ Added Lottie animations for all payment methods
- ✅ Implemented wallet balance validation
- ✅ Created responsive ticket-style order summary

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 👨‍💻 Developer

**Mayank Kumar Jha**

- GitHub: [@the-mayankjha](https://github.com/the-mayankjha)
- Project: [nFKs Payments](https://github.com/the-mayankjha/nFKs-Payments)

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Lottie for beautiful animations
- All contributors and supporters

---

© 2025-26 nFKs. All Rights Reserved
