# TrustCart

### AI-Powered Online Grocery Shopping with Seller Trust Score

TrustCart is a full-stack online grocery marketplace that brings **customers, sellers, delivery partners, and admins** together in one platform.

The main feature of the project is the **Seller Trust Score**, which uses seller verification, ratings, reviews, and complaint-related data to give customers a clearer idea of seller reliability.

---

## Features

### Customer

- Register and login
- Browse and search grocery products
- View product details and ratings
- Add products to cart
- Manage delivery addresses
- Place orders
- Make online payments
- Track order status
- Submit ratings and reviews
- View Seller Trust Score and AI Trust Summary

### Seller

- Seller registration and login
- Add, edit, and manage products
- Manage inventory
- Manage incoming orders
- View sales information
- View customer reviews
- View Seller Trust Score and its factors

### Delivery Partner

- Delivery partner login
- View assigned orders
- Update delivery status
- Share delivery location
- Confirm successful delivery

### Admin

- Admin dashboard
- Manage users
- Verify and manage sellers
- Manage products
- Monitor orders
- Manage delivery partners
- Manage reviews
- View platform reports

---

## Seller Trust Score

The **Seller Trust Score** is the defining feature of TrustCart.

The Trust Engine considers factors such as:

- Seller verification
- Customer ratings
- Review sentiment
- Complaint history
- Seller performance data

The system generates a **Trust Score** along with an **AI Trust Summary**. The score is visible to customers while browsing products and is also available to sellers and admins.

---

## System Architecture

TrustCart follows a layered architecture with a **React.js presentation layer, Node.js/Express application layer, and MongoDB data layer**.

The **AI Seller Trust Engine** works with seller verification and review-related data, while **Razorpay and Cloudinary** are used as external integrations.

```mermaid
flowchart TB

    User[Customer]
    Seller[Seller]
    Delivery[Delivery Partner]
    Admin[Admin]

    Frontend["React.js Frontend"]

    Backend["Node.js + Express.js"]
    Auth["JWT Authentication"]
    API["REST APIs"]

    Trust["AI Seller Trust Engine"]
    Database[("MongoDB")]

    Razorpay["Razorpay"]
    Cloudinary["Cloudinary"]

    User --> Frontend
    Seller --> Frontend
    Delivery --> Frontend
    Admin --> Frontend

    Frontend --> Backend

    Backend --> Auth
    Backend --> API

    API --> Database

    Database --> Trust
    Trust --> Database

    API --> Razorpay
    API --> Cloudinary
```

---

## Use Case Diagram

The system has four main roles: **User, Seller, Delivery Partner, and Admin**. Each role has its own set of functions within the platform.

```mermaid
flowchart LR

    User([User])
    Seller([Seller])
    Delivery([Delivery Partner])
    Admin([Admin])

    User --> U1[Register / Login]
    User --> U2[Browse Products]
    User --> U3[Manage Cart]
    User --> U4[Place Order]
    User --> U5[Make Payment]
    User --> U6[Track Order]
    User --> U7[Submit Reviews]
    User --> U8[View Seller Trust Score]

    Seller --> S1[Manage Products]
    Seller --> S2[Manage Inventory]
    Seller --> S3[Manage Orders]
    Seller --> S4[View Sales]
    Seller --> S5[View Trust Score]

    Delivery --> D1[View Assigned Orders]
    Delivery --> D2[Update Delivery Status]
    Delivery --> D3[Share Delivery Location]
    Delivery --> D4[Confirm Delivery]

    Admin --> A1[Manage Users]
    Admin --> A2[Verify Sellers]
    Admin --> A3[Manage Products]
    Admin --> A4[Monitor Orders]
    Admin --> A5[Manage Delivery Partners]
    Admin --> A6[Manage Reviews]
    Admin --> A7[View Reports]
```

---

## Database Design

The main entities represented in the project are:

- User
- Seller
- Product
- Order
- Review
- Delivery
- SellerTrust

The relationships include:

- User-to-Order
- Seller-to-Product
- Product-to-Review
- Seller-to-SellerTrust
- Order-to-Delivery

```mermaid
erDiagram

    USER ||--o{ ORDER : places
    SELLER ||--o{ PRODUCT : manages
    PRODUCT ||--o{ REVIEW : receives
    SELLER ||--|| SELLER_TRUST : has
    ORDER ||--|| DELIVERY : has

    USER {
        string id
        string name
        string email
        string role
    }

    SELLER {
        string id
        string name
        string email
        boolean verified
    }

    PRODUCT {
        string id
        string name
        number price
        number stock
    }

    ORDER {
        string id
        string userId
        number totalAmount
        string status
    }

    REVIEW {
        string id
        string productId
        string userId
        number rating
        string comment
    }

    DELIVERY {
        string id
        string orderId
        string status
    }

    SELLER_TRUST {
        string id
        string sellerId
        number score
        string summary
    }
```

---

## Data Flow Diagrams

### Level 0 DFD

The Level 0 DFD represents TrustCart as a single system and shows its interaction with the **User, Seller, Delivery Partner, Admin, and Payment Gateway**.

```mermaid
flowchart LR

    User[User]
    Seller[Seller]
    Delivery[Delivery Partner]
    Admin[Admin]
    Payment[Payment Gateway]

    System((TrustCart))

    User -->|Browse, Cart, Orders, Reviews| System
    System -->|Products, Orders, Trust Score, Status| User

    Seller -->|Products, Inventory, Order Updates| System
    System -->|Orders, Reviews, Trust Data| Seller

    Delivery -->|Delivery Updates, Location| System
    System -->|Assigned Orders| Delivery

    Admin -->|Management Actions| System
    System -->|Reports and Platform Data| Admin

    System -->|Payment Request| Payment
    Payment -->|Payment Status| System
```

### Level 1 DFD

The Level 1 DFD breaks the system into its major processes, including **user management, product management, cart and order management, payment processing, seller management, delivery management, review and trust management, and admin management**.

```mermaid
flowchart TB

    User[User]
    Seller[Seller]
    Delivery[Delivery Partner]
    Admin[Admin]
    Payment[Payment Gateway]

    P1[User Management]
    P2[Product Management]
    P3[Cart and Order Management]
    P4[Payment Processing]
    P5[Seller Management]
    P6[Delivery Management]
    P7[Review and Trust Management]
    P8[Admin Management]

    Database[(MongoDB)]
    Trust[AI Seller Trust Engine]

    User --> P1
    P1 --> Database

    User --> P2
    Seller --> P2
    P2 --> Database

    User --> P3
    Seller --> P3
    P3 --> Database

    P3 --> P4
    P4 --> Payment
    Payment --> P4
    P4 --> Database

    Seller --> P5
    Admin --> P5
    P5 --> Database

    Delivery --> P6
    Seller --> P6
    P6 --> Database

    User --> P7
    Seller --> P7
    Admin --> P7

    P7 --> Trust
    Trust --> P7
    P7 --> Database

    Admin --> P8
    P8 --> Database
```

---

## Application Flow

```text
Customer
   |
   v
Browse Products -> Product Details -> Cart -> Checkout -> Payment
                                                         |
                                                         v
                                                       Order
                                                         |
                    +------------------------------------+------------------+
                    |                                                       |
                    v                                                       v
                 Seller                                             Delivery Partner
                    |                                                       |
             Manage Order                                          Update Status
                    |                                                       |
                    +-------------------------+-----------------------------+
                                              |
                                              v
                                       Order Delivered


Customer Reviews + Seller Verification + Complaint/Performance Data
                              |
                              v
                       AI Trust Engine
                              |
                              v
                    Seller Trust Score
                              |
                              v
                      Customer Product View
```

---

## Technology Stack

| Layer | Technology |
|---|---|
| Frontend | React.js |
| Backend | Node.js, Express.js |
| Database | MongoDB |
| Authentication | JWT |
| AI | Custom AI/ML Trust Engine |
| Payment | Razorpay |
| Media Storage | Cloudinary |

---

## API Structure

The project uses REST APIs for the main application modules.

```text
/api/auth
/api/users
/api/sellers
/api/products
/api/orders
/api/payments
/api/delivery
```

Authentication is handled using **JWT tokens and role-based access control** across the four user roles.

---

## Project Structure

```text
TrustCart/
│
├── client/                         # React frontend
│   └── src/
│       ├── components/
│       ├── pages/
│       └── ...
│
├── server/                         # Node.js + Express backend
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── socket/
│   └── utils/
│
├── screenshots/                    # Project screenshots
│   ├── customer-home.png
│   ├── products.png
│   ├── product-details.png
│   ├── checkout-payment.png
│   ├── seller-dashboard.png
│   ├── seller-trust-score.png
│   ├── admin-dashboard.png
│   ├── admin-seller-management.png
│   └── delivery-dashboard.png
│
└── README.md
```

---

## Getting Started

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd TrustCart
```

### 2. Start the Backend

```bash
cd server
npm install
npm run dev
```

### 3. Start the Frontend

Open another terminal:

```bash
cd client
npm install
npm run dev
```

---

## Screenshots

### Customer Interface

#### Home Page

![Customer Home](./screenshots/customer-home.png)

#### Products

![Products](./screenshots/products.png)

#### Product Details

![Product Details](./screenshots/product-details.png)

#### Checkout & Payment

![Checkout & Payment](./screenshots/checkout.png)

---

### Seller Interface

#### Seller Dashboard

![Seller Dashboard](./screenshots/seller-dashboard.png)

#### Seller Trust Score

![Seller Trust Score](./screenshots/sellerproductadd.png)

---

### Admin Interface

#### Admin Dashboard

![Admin Dashboard](./screenshots/admindashboard.png)

#### Seller Management

![Admin Seller Management](./screenshots/admin-seller-management.png)

---

### Delivery Interface

#### Delivery Dashboard

![Delivery Dashboard](./screenshots/delivery-dashboard.png)

---

## Environment Variables

Create the required `.env` files for the frontend and backend and add the project credentials for services such as:

- MongoDB
- JWT
- Razorpay
- Cloudinary

> **Note:** Do not commit `.env` files or secret keys to GitHub.

---

## Security

- JWT-based authentication
- Role-based access control
- Passwords stored in hashed form
- Protected backend routes
- Secure handling of payment and user data
- Environment variables for sensitive credentials

---

## Future Improvements

- Improve the AI Trust Engine with more historical seller data
- Add more detailed analytics for sellers and admins
- Improve delivery tracking
- Add more automated trust and fraud detection features
- Improve scalability for a larger marketplace

---

## Project Team

**Pankhuri**  
**Poonam**  
**Prachee**

B.Tech Computer Science and Engineering  
Chitkara University

---

## License

This project was developed as an academic project.
