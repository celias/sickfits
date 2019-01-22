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

function totalItems(cart) {
  return cart.reduce((tally, cartItem) => tally + cartItem.quantity, 0)
  // console.log("Cart: ", cart);
};

class TakeMyMoney extends React.Component {

  onToken = res => {
    console.log('On Token Called!');
    console.log(res.id);
  }

  render() {
    return (
      <User>
        {({ data: { me } }) => (
          <StripeCheckout
            name="Sick Fits!"
            stripeKey="pk_test_XaRy9GyBdNOeSCGRY1SIutBo"
            currency="USD"
            token={res => this.onToken(res)}
            email={me.email}
            image={me.cart[0] && me.cart[0].item.image}
            description={`Order of ${totalItems(me.cart)} items!`}
            amount={calcTotalPrice(me.cart)}>
            {this.props.children}</StripeCheckout>
        )}
      </User>
    )
  }
};

export default TakeMyMoney;