import { expect } from 'chai';
import { isAncestor, isDesendant } from '../fiber';

describe('fiber', () => {
  // Assume this tree
  //
  //        A
  //       / \
  //      B   C
  //     / \   \
  //    D   E   F
  //
  // Level 0
  const A = { return: null };

  // Level 1
  const C = { return: A };
  const B = { return: A, sibling: C };
  A.child = B;

  // Level 2
  const E = { return: B };
  const D = { return: B, sibling: E };
  B.child = D;

  const F = { return: C };
  C.child = F;

  it('isAncestor', () => {
    expect(isAncestor(A, A)).to.be.false;
    expect(isAncestor(A, B)).to.be.true;
    expect(isAncestor(A, C)).to.be.true;
    expect(isAncestor(A, D)).to.be.true;
    expect(isAncestor(A, E)).to.be.true;
    expect(isAncestor(A, F)).to.be.true;

    expect(isAncestor(B, A)).to.be.false;
    expect(isAncestor(B, B)).to.be.false;
    expect(isAncestor(B, C)).to.be.false;
    expect(isAncestor(B, D)).to.be.true;
    expect(isAncestor(B, E)).to.be.true;
    expect(isAncestor(B, F)).to.be.false;

    expect(isAncestor(C, A)).to.be.false;
    expect(isAncestor(C, B)).to.be.false;
    expect(isAncestor(C, C)).to.be.false;
    expect(isAncestor(C, D)).to.be.false;
    expect(isAncestor(C, E)).to.be.false;
    expect(isAncestor(C, F)).to.be.true;

    expect(isAncestor(D, A)).to.be.false;
    expect(isAncestor(D, B)).to.be.false;
    expect(isAncestor(D, C)).to.be.false;
    expect(isAncestor(D, D)).to.be.false;
    expect(isAncestor(D, E)).to.be.false;
    expect(isAncestor(D, F)).to.be.false;

    expect(isAncestor(E, A)).to.be.false;
    expect(isAncestor(E, B)).to.be.false;
    expect(isAncestor(E, C)).to.be.false;
    expect(isAncestor(E, D)).to.be.false;
    expect(isAncestor(E, E)).to.be.false;
    expect(isAncestor(E, F)).to.be.false;

    expect(isAncestor(F, A)).to.be.false;
    expect(isAncestor(F, B)).to.be.false;
    expect(isAncestor(F, C)).to.be.false;
    expect(isAncestor(F, D)).to.be.false;
    expect(isAncestor(F, E)).to.be.false;
    expect(isAncestor(F, F)).to.be.false;
  });

  it('isDesendant', () => {
    expect(isDesendant(A, A)).to.be.false;
    expect(isDesendant(A, B)).to.be.false;
    expect(isDesendant(A, C)).to.be.false;
    expect(isDesendant(A, D)).to.be.false;
    expect(isDesendant(A, E)).to.be.false;
    expect(isDesendant(A, F)).to.be.false;

    expect(isDesendant(B, A)).to.be.true;
    expect(isDesendant(B, B)).to.be.false;
    expect(isDesendant(B, C)).to.be.false;
    expect(isDesendant(B, D)).to.be.false;
    expect(isDesendant(B, E)).to.be.false;
    expect(isDesendant(B, F)).to.be.false;

    expect(isDesendant(C, A)).to.be.true;
    expect(isDesendant(C, B)).to.be.false;
    expect(isDesendant(C, C)).to.be.false;
    expect(isDesendant(C, D)).to.be.false;
    expect(isDesendant(C, E)).to.be.false;
    expect(isDesendant(C, F)).to.be.false;

    expect(isDesendant(D, A)).to.be.true;
    expect(isDesendant(D, B)).to.be.true;
    expect(isDesendant(D, C)).to.be.false;
    expect(isDesendant(D, D)).to.be.false;
    expect(isDesendant(D, E)).to.be.false;
    expect(isDesendant(D, F)).to.be.false;

    expect(isDesendant(E, A)).to.be.true;
    expect(isDesendant(E, B)).to.be.true;
    expect(isDesendant(E, C)).to.be.false;
    expect(isDesendant(E, D)).to.be.false;
    expect(isDesendant(E, E)).to.be.false;
    expect(isDesendant(E, F)).to.be.false;

    expect(isDesendant(F, A)).to.be.true;
    expect(isDesendant(F, B)).to.be.false;
    expect(isDesendant(F, C)).to.be.true;
    expect(isDesendant(F, D)).to.be.false;
    expect(isDesendant(F, E)).to.be.false;
    expect(isDesendant(F, F)).to.be.false;
  });
});
