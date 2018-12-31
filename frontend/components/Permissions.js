import { Query, renderToStringWithData } from 'react-apollo';
import gql from 'graphql-tag';
import Error from './ErrorMessage';
import Table from './styles/Table';
import SickButton from './styles/SickButton';

const possiblePermissions = [
  'Admin',
  'User',
  'Item Create',
  'Item Update',
  'Item Delete',
  'Permission Update',
];

const ALL_USERS_QUERY = gql`
  query {
    users {
      id
      name
      email
      permissions
    }
  }
`;

const Permissions = props => (
  <Query query={ALL_USERS_QUERY}>
    {({ data, loading, error }) => console.log("Permissions: ", data) || (
      <div>
        <Error error={error} />
        <div>
          <h1>Manage Permissions</h1>
          <Table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                {possiblePermissions.map((permission, index) =>
                  <th key={index}>{permission}</th>)}
                <th>👇</th>
              </tr>
            </thead>
            <tbody>
              {data.users.map((user, index) =>
                <User key={index} user={user} />
              )}
            </tbody>
          </Table>
        </div>
      </div>
    )}
  </Query>
);

// Seperate Component to map over the ABOVE users
class User extends React.Component {
  render() {
    const user = this.props.user;
    return (
      <tr>
        <td>{user.name}</td>
        <td>{user.email}</td>
        {possiblePermissions.map((permission, index) => (
          <td key={index}>
            <label htmlFor={`${user.id}-permission-${permission}`}>
              <input type="checkbox" />
            </label>
          </td>
        ))}
        <td>
          <SickButton>Update</SickButton>
        </td>
      </tr>
    )
  }
}

export default Permissions;