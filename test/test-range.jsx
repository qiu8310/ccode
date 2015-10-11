import assert from 'should'
import Range from '../src/lib/Range.jsx';

describe('Range', () => {


  context('Empty Range', () => {

    it('should count to zero', () => {
      new Range().count.should.eql(0);
    });

    it('should stringify to empty array', () => {
      new Range().toString().should.eql('[]');
    })
  });

  context('Add', () => {
    it('should add single number', () => {
      new Range().add(1).toString().should.eql('[[1]]');
    });

    it('should add double number', () => {
      new Range().add(1, 2).toString().should.eql('[[1,2]]');
    });

    it('should throw when added number is outof range', () => {
      assert.throws(() => {
        new Range().add(Range.MIN_NUMBER - 1);
      }, 'NUMBER_OUT_OF_RANGE');

      assert.throws(() => {
        new Range().add(Range.MAX_NUMBER + 1);
      }, 'NUMBER_OUT_OF_RANGE');
    });
    
    it('should throw when end is less then start', () => {
      assert.throws(() => {
        new Range().add(3, 1);
      }, 'START_SHOULD_LESS_THEN_END');
    });
    
    it('should add sequence and compress it', () => {
      new Range().add(1, 3).add(4).add(2, 5).toString().should.eql('[[1,5]]');
      new Range().add(2, 100).add(3).add(4).toString().should.eql('[[2,100]]');
      new Range().add(1).add(2).add(4,6).toString().should.eql('[[1,2],[4,6]]');
    });

    it('should throw START_OUT_OF_ORDER when add start number is less then last start', () => {
      assert.throws(() => {
        new Range().add(2, 6).add(1);
      }, 'START_OUT_OF_ORDER');
    });
  });

  context('extract', () => {
    it('extract small range', () => {
      let r = new Range().add(1, 10).add(20, 30);
      r.extract(0, 5).toString().should.eql('[[1,5]]');
      r.extract(1, 5).toString().should.eql('[[1,5]]');
      r.extract(0, 11).toString().should.eql('[[1,10]]');
      r.extract(5, 10).toString().should.eql('[[5,10]]');
      r.extract(5, 11).toString().should.eql('[[5,10]]');
      r.extract(5, 20).toString().should.eql('[[5,10],[20]]');
      r.extract(5, 23).toString().should.eql('[[5,10],[20,23]]');
      r.extract(5, 30).toString().should.eql('[[5,10],[20,30]]');
      r.extract(5, 39).toString().should.eql('[[5,10],[20,30]]');
    });
  });

  context('contains', () => {
    it('should contains number', () => {
      new Range().add(10, 20).contains(10).should.eql(true);
      new Range().add(10, 20).contains(15).should.eql(true);
      new Range().add(10, 20).contains(20).should.eql(true);
      new Range().add(10, 20).contains(5).should.eql(false);
      new Range().add(10, 20).contains(25).should.eql(false);
    });
  });

  context('eachNumber', () => {
    it('should iterate each number', () => {
      let i = 0;
      new Range().add(1).add(3).add(5, 6).eachNumber((n) => {
        i += n;
      });
      i.should.eql(15);
    });
  });

});
