describe('mocking learning', () => {
  it('mocks a reg function', () => {
    const fetchCats = jest.fn();
    fetchCats('Snickers');
    expect(fetchCats).toHaveBeenCalled();
    expect(fetchCats).toHaveBeenCalledWith('Snickers');
    fetchCats('Lu' * 2);
    expect(fetchCats).toHaveBeenCalledTimes(2);
  });
});