# Advanced React and GraphQL
This is my work for Wes Bos's [Advanced React + GraphQL](https://advancedreact.com/) course.

My final version of the project can be seen [here](https://sickfits-next-react-prod.herokuapp.com/). It may take a while to load the first time because now.sh sleeps free-tier deployments that haven't received a request recently.

# Sick Fits
Sick Fits is a full stack online clothing store complete with real credit checkout. Users can search, sell, add to cart and checkout their favorite items. The application has five main models — __Users, Items, Orders, CartItems, and OrderItems__ — all of which are relational and showcase the power of relational GraphQL Queries.

The app also includes many server-side aspects including including JWT authentication, permissions, sending email, uploading images, and charging credit cards with Stripe.

In addition to building both the front and backend, the last 1/3 of the course was spent testing the App.

# Tech Stack
 **FRONTEND**

_For building the Interface_

- React.js - JavaScript Library 
- Next.js - for server side rendering, routing and tooling
- React-Apollo - for interfacing with Apollo Client
- Jest & Enzyme - for Testing

_For Data Management_

- _Apollo Client_
- Performing GraphQL Mutations
- Fetching GraphQL Queries
- Caching GraphQL Data
- Managing Local State
- Error and Loading UI States
- __Apollo Client replaces the need for redux + data fetching/caching libraries__

**BACKEND** 

_An Express/GraphQL Server_

- _GraphQL Yoga_
- Implementing Query and Mutation Resolvers
- Custom Server Side Logic
- Charging Credit Cards with Stripe
- Sending Email (Dev only with MailTrap)
- Performing JWT Authentication
- Checking Permissions

_Prisma_ - A GraphQL Database Interface

- Provides a set of GraphQL CRUD APIs for a MySQL, Postgres or MongoDB Database
- Schema Definition
- Data Relationships
- Queried Directly from our Yoga Server
- Self-hosted or as-a-service

##Concepts Covered
- React Best Practices
- Server Side Rendering
- Styled Components
- Theming
- Render Props
- Routing
- GraphQL Schema
- Queries and Mutations
- JSON Web Token (JWT)
- Resolvers
- Cache Management
- Loading and Error States
- Sending Email
- Logic and Flow with Async + Await
- Authentication and Permissions
- Charging Credit Cards
- Hosting and Transforming Images
- Pagination
- Forms in React
- Animations
- Third party React Components
- Unit Testing
- Mocking Components
- Mounting vs Shallow Rendering
- Deployment

