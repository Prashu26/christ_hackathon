# TODO List for Signup Page, Admin Page, Verification Form, and Routing Implementation

## Completed Tasks
- [x] Create signup page component with Tailwind CSS and Framer Motion
- [x] Implement Aadhaar-to-OTP flow in signup page
- [x] Add animations using Framer Motion for interactive elements
- [x] Implement navigation to landing page after signup/login
- [x] Add route for "/signup" in App.jsx
- [x] Import Signup component in App.jsx
- [x] Create admin page with photo/profile section
- [x] Implement verifier approval functionality
- [x] Add approve/reject buttons that remove requests when clicked
- [x] Integrate email functionality for notifications
- [x] Use Tailwind CSS and Framer Motion for admin page
- [x] Add route for "/admin" in App.jsx
- [x] Import Admin component in App.jsx
- [x] Update GenerateQR page to display User/Verifier options side by side
- [x] Create verification form component with form fields (Form Name, University/Company Name, Option)
- [x] Add "Verify" button to generateQR page that navigates to /verify
- [x] Add route for "/verify" in App.jsx
- [x] Implement navigation to next part (/user) after verification form submission
- [x] Use Tailwind CSS theming with gradient background and proper styling
- [x] Add Framer Motion animations for form entrance and button interactions
- [x] Create routes for signup.jsx, admin.jsx, and verify.jsx
- [x] Make signup the default route at "/"
- [x] Add route for landing page at "/landing"
- [x] Import all necessary components (LandingPage, Admin, Verify)
- [x] Resolve merge conflicts in App.jsx
- [x] Add margin and spacing fixes to admin page
- [x] Implement conditional navbar loading (SimpleNavbar for signup page, regular Navbar for others)
- [x] Use useLocation hook for route-based navbar switching
- [x] Modify generateQR.jsx to navigate to /verify first when Verifier is clicked
- [x] Ensure verify.jsx navigates to /verifier after form submission

## Pending Tasks
- [ ] Test the signup page rendering and functionality
- [ ] Verify navigation to landing page after signup
- [ ] Test admin page verifier approval functionality
- [ ] Verify email notifications for approvals/rejections
- [ ] Ensure responsive design with Tailwind CSS
- [ ] Add form validation for signup options (if needed)
- [ ] Integrate with backend API for actual signup and admin processes
- [ ] Test verification form flow from generateQR to verify to user page
- [ ] Test all routes and navigation between pages
- [ ] Test conditional navbar loading functionality
- [ ] Test the new verifier flow: generateQR → verify → verifier

## Notes
- Signup page located at frontend/src/pages/signup.jsx
- Admin page located at frontend/src/pages/admin.jsx
- Verification form located at frontend/src/components/verify.jsx
- Landing page located at frontend/src/pages/landingpage.jsx
- Routes added: / (signup), /admin, /verify, /landing
- Uses Tailwind CSS for styling and Framer Motion for animations
- After signup, navigates to landing page (/)
- Admin page includes profile photo, approval requests, and email functionality
- GenerateQR page updated to show User/Verifier options side by side
- After verification form submission, navigates to /user
- Two signup options: Signup with Aadhaar Card and Signup with Aadhaar Number
- Verification form has three fields: Form Name, University/Company Name, Option (Form/University/Company)
- Merge conflicts resolved in App.jsx
- All necessary imports added to App.jsx
- Conditional navbar: SimpleNavbar for "/" route, regular Navbar for all other routes
- Uses useLocation hook from react-router-dom for route detection
- **New Verifier Flow:** generateQR.jsx → verify.jsx → VerifierPage.jsx
- When "Verifier" is clicked in generateQR, it goes to /verify first
- After submitting verification form, it navigates to /verifier
