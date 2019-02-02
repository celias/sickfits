import { mount } from 'enzyme';
import wait from 'waait';
import PleaseSignin from '../components/PleaseSignin';
import { CURRENT_USER_QUERY } from '../components/User';
import { MockedProvider } from 'react-apollo/test-utils';
import { fakeUser } from '../lib/testUtils';

const notSignedInMocks = [
  {
    // when someone makes a request with this query and combo
    request: {
      query: CURRENT_USER_QUERY,
    },
    // then, return this fake data (mocked data)
    result: {
      data: {
        me: null,
      },
    },
  },
];

const signedInMocks = [
  {
    request: {
      query: CURRENT_USER_QUERY,
    },
    result: {
      data: {
        me: fakeUser(),
      },
    },
  },
];

describe('<PleaseSignin/>', () => {
  it('renders the signed in dialog to logged out users', async () => {
    const wrapper = mount(
      <MockedProvider mocks={notSignedInMocks}>
        <PleaseSignin />
      </MockedProvider>
    );
    await wait();
    wrapper.update();
    // console.log(wrapper.debug());
    expect(wrapper.text()).toContain('Please Sign In before Continuing!');

    const signin = wrapper.find('Signin');
    expect(signin.exists()).toBe(true);
    // console.log(signin.debug());
  });

  it('renders a child component when the user is signed in  ', async () => {
    const Hey = () => <p>Hey!</p>
    const wrapper = mount(
      <MockedProvider mocks={signedInMocks}>
        <PleaseSignin>
          <Hey />
        </PleaseSignin>
      </MockedProvider>
    );

    await wait();
    wrapper.update();
    // console.log(wrapper.debug());
    expect(wrapper.contains(<Hey />)).toBe(true);
  });
});