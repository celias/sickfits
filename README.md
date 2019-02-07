# Advanced React and GraphQL
This is my work for Wes Bos's [Advanced React + GraphQL](https://advancedreact.com/) course.

My final version of the project can be seen [here](https://sickfits-next-react-prod.herokuapp.com/). It may take a while to load the first time because now.sh sleeps free-tier deployments that haven't received a request recently.

# Sick Fits
Sick Fits is a full stack online clothing store complete with real credit checkout. Users can search, sell, add to cart and checkout their favorite items. The application has five main models — __Users, Items, Orders, CartItems, and OrderItems__ — all of which are relational and showcase the power of relational GraphQL Queries.

The app also includes many server-side aspects including including JWT authentication, permissions, sending email, uploading images, and charging credit cards with Stripe.

In addition to building both the front and backend, the last 1/3 of the course was spent testing the App.

# Tech Stack
 _FRONTEND_

_For building the interface_

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


