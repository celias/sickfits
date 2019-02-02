import { mount } from 'enzyme';
import toJSON from 'enzyme-to-json';
import wait from 'waait';
import Nav from '../components/Nav';
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

describe('<Nav />', () => {
  it('renders a minimal nav when the user is signed out', async () => {
    const wrapper = mount(
      <MockedProvider mocks={notSignedInMocks}>
        <Nav />
      </MockedProvider>
    );
    await wait();
    wrapper.update();
    // console.log(wrapper.debug());
    const nav = wrapper.find('ul[data-test="nav"]');
    // console.log(nav.debug());
    expect(nav.children().length).toBe(2);
    expect(nav.text()).toContain('Sign In');
    expect(nav.text()).toContain('Shop');
    // console.log("Here: ", nav.text());
    expect(toJSON(nav)).toMatchSnapshot();
  });

  it('renders the full nav when the user is signed in', async () => {
    const wrapper = mount(
      <MockedProvider mocks={signedInMocks}>
        <Nav />
      </MockedProvider>
    );
    await wait();
    wrapper.update();
    // console.log(wrapper.debug());

    const nav = wrapper.find('ul[data-test="nav"]');
    expect(nav.children().length).toBe(6);
    expect(nav.text()).toContain('Shop');
    expect(nav.text()).toContain('Account');
    expect(nav.text()).toContain('Sign Out');
    expect(nav.text()).toContain('Orders');
    expect(nav.text()).toContain('My Cart');
    expect(nav.text()).toContain('Sell');

    expect(toJSON(nav)).toMatchSnapshot();
    // console.log(nav.debug());
  });
});