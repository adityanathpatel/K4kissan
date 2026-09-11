# KisanMarket - Testing Guide

## Manual Testing Checklist

### 1. Authentication & User Management

#### Sign Up / Login
- [ ] Sign up with valid email
- [ ] Sign up with invalid email (should show error)
- [ ] Login with correct credentials
- [ ] Login with wrong password (should show error)
- [ ] Logout successfully
- [ ] Session persists on page refresh
- [ ] Redirects to login when accessing protected routes without auth

#### User Profile
- [ ] View profile information
- [ ] Edit profile (name, location)
- [ ] Profile changes save correctly
- [ ] Profile data persists after logout/login

---

### 2. Farmer Workflows

#### Product Management
- [ ] Add new product with all fields
- [ ] Add product with image URL
- [ ] Edit existing product
- [ ] Delete product
- [ ] View list of all products
- [ ] Products display correctly with images
- [ ] Product quantity updates
- [ ] Cannot add product with negative price
- [ ] Cannot add product with empty required fields

#### Order Management
- [ ] View all orders for farmer's products
- [ ] See order details (items, buyer info, total)
- [ ] Update order status (pending → confirmed → shipped → delivered)
- [ ] Filter orders by status
- [ ] Order status updates reflect immediately
- [ ] Buyer receives notification on status change

#### Analytics Dashboard
- [ ] View total products count
- [ ] View total orders count
- [ ] View total revenue
- [ ] See price comparison chart
- [ ] See sales trend chart
- [ ] View top selling products
- [ ] Charts display correctly with data
- [ ] Empty state when no data

---

### 3. Buyer Workflows

#### Browse & Search
- [ ] Browse all products
- [ ] Search products by name
- [ ] Filter products by category
- [ ] View product details
- [ ] See product images
- [ ] See farmer information
- [ ] Products sorted by newest first

#### Shopping Cart
- [ ] Add product to cart
- [ ] View cart items
- [ ] Update quantity in cart
- [ ] Remove item from cart
- [ ] Cart count badge updates
- [ ] Cart persists across pages
- [ ] Cart persists after page refresh

#### Checkout & Orders
- [ ] Proceed to checkout
- [ ] Fill in shipping details
- [ ] Complete mock payment
- [ ] Order created successfully
- [ ] Order appears in "My Orders"
- [ ] Can track order status
- [ ] Farmer receives notification of new order

#### Reviews & Ratings
- [ ] View product ratings
- [ ] See review count
- [ ] Read product reviews
- [ ] Write review for delivered product
- [ ] Submit rating (1-5 stars)
- [ ] Cannot review undelivered product
- [ ] Review appears on product page

---

### 4. Real-time Features

#### Chat System
- [ ] Start conversation with farmer
- [ ] Send message
- [ ] Receive message in real-time
- [ ] See message history
- [ ] Messages persist
- [ ] Unread conversation indicator
- [ ] Navigate to chat from product page

#### Notifications
- [ ] Receive notification for new order
- [ ] Receive notification for order status change
- [ ] See unread count badge
- [ ] Mark notification as read
- [ ] Click notification navigates to relevant page
- [ ] Notifications persist
- [ ] Notification count updates in real-time

---

### 5. Advanced Features

#### Map View
- [ ] View products on map
- [ ] See product markers
- [ ] Click marker shows product popup
- [ ] Filter by location
- [ ] Filter by radius (5-500km)
- [ ] Search by location
- [ ] Get current location
- [ ] Toggle between map and list view

#### Multi-language
- [ ] Switch to Hindi
- [ ] All navigation text translates
- [ ] Language persists on refresh
- [ ] Switch back to English
- [ ] Globe icon shows current language

#### Offline Mode
- [ ] Go offline (DevTools Network → Offline)
- [ ] See offline banner
- [ ] Previously loaded pages still work
- [ ] Service worker caches assets
- [ ] Go back online, banner disappears
- [ ] PWA installable

---

### 6. Security Testing

#### Authentication
- [ ] Cannot access farmer dashboard without login
- [ ] Cannot access buyer orders without login
- [ ] Cannot access chat without login
- [ ] Redirected to login page when unauthenticated
- [ ] Cannot view other users' data

#### Input Validation
- [ ] Email validation on signup
- [ ] Phone number validation (10 digits)
- [ ] Pincode validation (6 digits)
- [ ] Price validation (positive number)
- [ ] Quantity validation (positive integer)
- [ ] Required fields cannot be empty
- [ ] XSS prevention (React handles automatically)

#### RLS Policies
- [ ] Users only see their own orders
- [ ] Users only see their own addresses
- [ ] Users only see their own notifications
- [ ] Farmers only edit their own products
- [ ] Buyers only review their own purchases

---

### 7. UI/UX Testing

#### Responsive Design
- [ ] Desktop view (1920x1080)
- [ ] Laptop view (1366x768)
- [ ] Tablet view (768x1024)
- [ ] Mobile view (375x667)
- [ ] Navigation menu works on mobile
- [ ] Forms are usable on mobile
- [ ] Images scale properly

#### Error Handling
- [ ] Network error shows user-friendly message
- [ ] Form validation errors are clear
- [ ] Loading states display correctly
- [ ] Empty states are informative
- [ ] Error boundary catches crashes

#### Performance
- [ ] Pages load within 3 seconds
- [ ] Images lazy load
- [ ] No console errors
- [ ] Smooth animations
- [ ] Charts render quickly

---

### 8. Browser Compatibility

Test on:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

---

### 9. Edge Cases & Error Scenarios

#### Network Issues
- [ ] Slow 3G connection
- [ ] Intermittent connection
- [ ] Complete offline
- [ ] Failed API requests
- [ ] Timeout scenarios

#### Data Edge Cases
- [ ] Empty product list
- [ ] Empty cart
- [ ] No orders
- [ ] No notifications
- [ ] No saved addresses
- [ ] Product out of stock
- [ ] Very long product names
- [ ] Very long descriptions
- [ ] Special characters in inputs

#### Concurrent Actions
- [ ] Multiple users ordering same product
- [ ] Multiple browser tabs
- [ ] Rapid clicking on buttons
- [ ] Form submission during network error

---

## Test User Accounts

### Farmer Account
- Email: `farmer@test.com`
- Password: `test123`
- Should have products listed

### Buyer Account
- Email: `buyer@test.com`
- Password: `test123`
- Should have order history

---

## Automated Testing (Future)

Consider implementing:
- Unit tests (Jest + React Testing Library)
- Integration tests (Cypress/Playwright)
- API tests (Supabase RLS policies)
- E2E tests for critical flows
- Performance testing (Lighthouse)

---

## Reporting Bugs

When reporting bugs, include:
1. Steps to reproduce
2. Expected behavior
3. Actual behavior
4. Browser and OS
5. Screenshot/video if applicable
6. Console errors

---

## Production Readiness Checklist

Before deploying to production:
- [ ] All critical bugs fixed
- [ ] Security audit passed
- [ ] Performance optimized
- [ ] Database backups enabled
- [ ] Environment variables configured
- [ ] HTTPS enabled
- [ ] Monitoring/logging setup
- [ ] Error tracking (Sentry/etc)
- [ ] CDN for assets (if needed)
- [ ] Database indexes optimized
