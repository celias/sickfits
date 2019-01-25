import React from 'react';
import { Query } from 'react-apollo';
import { formatDistance } from 'date-fns';
import Link from 'next/link';
import styled from 'styled-components';
import gql from 'graphql-tag';
import formatMoney from '../lib/formatMoney';
import OrderItemStyles from './styles/OrderItemStyles';
import Error from './ErrorMessage';

const USER_ORDERS_QUERY = gql`
  query USER_ORDERS_QUERY {
    orders(orderBy: createdAt_DESC) {
      id
      total
      createdAt
      items {
        id
        title
        price
        description
        quantity
        image
      }
    }
  }
`;

const OrderUl = styled.ul`
  display: grid;
  grid-gap: 4rem;
  grid-template-columns: repeat(auto-fit, min-max(40%, 1fr));
`;

class OrderList extends React.Component {
  render() {
    return (<Query query={USER_ORDERS_QUERY}>
      {({ data: { orders }, loading, error }) => {
        if (loading) return <p>Loading...</p>
        if (error) return <Error error={error} />
        console.log(orders);
        return (
          <div>
            <h2>You have {orders.length} orders.</h2>
            <OrderUl>
              {orders.map(order => (
                <OrderItemStyles>
                  <Link href={{
                    pathName: '/order',
                    query: { id: order.id },
                  }}>
                    <a>HI</a>
                  </Link>
                </OrderItemStyles>
              ))}
            </OrderUl>
          </div>
        )
      }}
    </Query>)

  }
}
export default OrderList;