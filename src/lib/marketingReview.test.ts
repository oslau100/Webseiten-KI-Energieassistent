import {describe,it,expect} from 'vitest';
import {marketingReviewRating} from './marketingReview';
describe('configured review ratings',()=>{
 it.each([undefined,null,'5',NaN,Infinity,-1,6,2.5])('does not invent a customer score from %s',value=>{
  expect(marketingReviewRating(value,true)).toBeUndefined();
 });
 it.each([0,1,2,3,4,5])('preserves configured integer %s',value=>expect(marketingReviewRating(value,true)).toBe(value));
 it.each([undefined, null, 0, 2, 5, 6, '2'])('retains the original reference-only five stars for %s', value=>expect(marketingReviewRating(value,false)).toBe(5));
});
