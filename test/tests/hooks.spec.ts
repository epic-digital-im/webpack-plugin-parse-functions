import run from '../src';
import { Hook } from '@@functions/hook';
import { ClassNames } from '@@functions/types';

const TEST_OBJECT_NAME = 'test';

describe('Test hooks', () => {
  async function getTestObject() {
    const q = new Parse.Query<Hook>(ClassNames.Hook).equalTo('name', TEST_OBJECT_NAME);
    const o = await q.find({ useMasterKey: true });
    return o[0];
  }

  beforeAll(async () => {
    const Parse = await run();
    const o = await getTestObject();
    if (o) {
      await o.destroy();
    }
  });

  afterAll(async () => {
    // close stuff
    const o = await getTestObject();
    if (o) {
      await o.destroy();
    }
  });

  test('should run create hooks', async () => {
    let C = Parse.Object.extend(ClassNames.Hook);
    let o: Hook = new C();
    o.set('name', TEST_OBJECT_NAME);
    await o.save();
    o = await getTestObject();
    const hooksRun = o.get('hooksRun');

    expect(hooksRun).toContain('beforeCreate');
    expect(hooksRun).toContain('afterCreate');
    expect(hooksRun).toContain('beforeSave');
    expect(hooksRun).toContain('afterSave');
    expect(hooksRun).not.toContain('beforeUpdate');
    expect(hooksRun).not.toContain('afterUpdate');
  });
  
  test('should run update hooks', async () => {
    let o = await getTestObject();
    let hooksRun = o.get('hooksRun');
    expect(hooksRun).toContain('beforeSave');
    expect(hooksRun).not.toContain('beforeUpdate');
    await wait(600);
    o.set('updatedAt', new Date());
    await o.save(null, { useMasterKey: true });
    await wait(600);
    o = await getTestObject()
    hooksRun = o.get('hooksRun');
    expect(hooksRun).toContain('beforeUpdate');
    expect(hooksRun).toContain('afterUpdate');
  });
});

function wait(ms: number = 1000): Promise<null> {
  return new Promise((res) => {
    setTimeout(res, ms, null);
  });
}
