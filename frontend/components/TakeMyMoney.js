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
};

class TakeMyMoney extends React.Component {
  render() {
    const data = this.props.children.data.me;
    console.log("WOWOWO", data);
    return (
      <User>
        {({ data: { me } }) => (
          <StripeCheckout
            name="Sick Fits!"
            image={me.cart[0] && me.cart[0].item.image}
            description={`Order of ${totalItems(me.cart)} items!`}
            shippingAddress
            amount={calcTotalPrice(me.cart)}>
            {this.props.children}</StripeCheckout>
        )}
      </User>
    )
  }
};

export default TakeMyMoney;