import React from 'react';
import StripeCheckout from 'react-stripe-checkout';
import { Mutation } from 'react-apollo';
import Router from 'next/router';
import NProgress from 'nprogress';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import CalcTotalPrice from '../lib/calcTotalPrice';
import Error from './ErrorMessage';
import User, { CURRENT_USER_QUERY } from './User';
import calcTotalPrice from '../lib/calcTotalPrice';

const CREATE_ORDER_MUTATION = gql`
  mutation createOrder($token: String!) {
    createOrder(token: $token) {
      id
      charge
      total 
      items {
        id
        title
      }
    }
  }
`

function totalItems(cart) {
  return cart.reduce((tally, cartItem) => tally + cartItem.quantity, 0)
  // console.log("Cart: ", cart);
};

class TakeMyMoney extends React.Component {

  onToken = async (res, createOrder) => {
    console.log('On Token Called!');
    console.log(res.id);
    // Manually call the mutation once I have the Stripe Token
    const order = await createOrder({
      variables: {
        token: res.id
      }
    }).catch(err => {
      alert(err.message)
    });
    console.log(order);
  }

  render() {
    return (
      <User>
        {({ data: { me } }) => (
          <Mutation
            mutation={CREATE_ORDER_MUTATION}
            refetchQueries={[{ query: CURRENT_USER_QUERY }]}>

            {(createOrder) => (
              <StripeCheckout
                name="Sick Fits!"
                stripeKey="pk_test_XaRy9GyBdNOeSCGRY1SIutBo"
                currency="USD"
                email={me.email}
                image={me.cart.length && me.cart[0].item && me.cart[0].item.image}
                description={`Order of ${totalItems(me.cart)} items!`}
                token={res => this.onToken(res, createOrder)}
                amount={calcTotalPrice(me.cart)}
              >
                {this.props.children}
              </StripeCheckout>
            )}
          </Mutation>
        )}
      </User>
    );
  }
};

export default TakeMyMoney;