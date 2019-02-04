import formatMoney from '../lib/formatMoney';

describe('formatMoney function', () => {
  it('works with fractional dollars', () => {
    expect(formatMoney(1)).toEqual('$0.01');
    expect(formatMoney(10)).toEqual('$0.10');
    expect(formatMoney(45)).toEqual('$0.45');
  });

  it('leaves cents off for whole dollars', () => {
    expect(formatMoney(100)).toEqual('$1');
    expect(formatMoney(500)).toEqual('$5');
    expect(formatMoney(7000)).toEqual('$70');
    expect(formatMoney(70000)).toEqual('$700');
    expect(formatMoney(70000000)).toEqual('$700,000');
  });

  it('works with whole and fractional numbers', () => {
    expect(formatMoney(115)).toEqual('$1.15');
    expect(formatMoney(545)).toEqual('$5.45');
    expect(formatMoney(2545)).toEqual('$25.45');
    expect(formatMoney(28545)).toEqual('$285.45');
  })
});