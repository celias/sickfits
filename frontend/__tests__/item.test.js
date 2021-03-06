import Item from '../components/Item';
import { shallow } from 'enzyme';
import toJSON from 'enzyme-to-json';

const fakeItem = {
  id: 'SLOWDIVE123',
  title: 'A Great Item',
  price: 3000,
  description: 'Love it.',
  image: 'cool.jpg',
  largeImage: 'cooler.jpg',
};

describe('<Item/>', () => {
  it('renders the image properly', () => {
    const wrapper = shallow(<Item item={fakeItem} />);
    const img = wrapper.find('img');
    expect(img.props().src).toBe(fakeItem.image);
    expect(img.props().alt).toBe(fakeItem.title);
    // console.log(img.debug());
  });

  it('matches the snapshot', () => {
    const wrapper = shallow(<Item item={fakeItem} />);
    expect(toJSON(wrapper)).toMatchSnapshot();
  });

  it('renders priceTag and title', () => {
    const wrapper = shallow(<Item item={fakeItem} />);
    const PriceTag = wrapper.find('PriceTag');
    // console.log(PriceTag.children());
    expect(PriceTag.children().text()).toBe('$30');
    expect(wrapper.find('Title a').text()).toBe(fakeItem.title);
    // console.log(fakeItem.title.length)
    // console.log(wrapper.debug());
  });

  it('renders out the button properly', () => {
    const wrapper = shallow(<Item item={fakeItem} />);
    const buttonList = wrapper.find('.buttonList');
    expect(buttonList.children()).toHaveLength(3);
    // console.log(buttonList.children().length);
    expect(buttonList.find('Link')).toHaveLength(1);
    // console.log(buttonList.children('Link').length);
  });
});