const success = desc => console.log(`${desc} : Pass`);
const failure = (desc, msg) => console.log(`:( ${desc} : Fail => ${msg}`);
const log = desc => console.log(desc);

const activity = {};
const stack = [];
const isEmptyStack = () => stack.length === 0;
const stackTop = () => stack[stack.length - 1];
const ctx = {};

const spush = (key, val) => stackTop()[key].push(val);

const indentedTitle = ctxt =>
  `${stack.map(() => '   ').join('')}${ctxt}`;

const newTop = title =>
  ({ title, setup: [], teardown: [],testSet:[] });

const execTop = () => 'setup testSet teardown'.split(' ')
  .forEach(key => stackTop()[key].forEach(activity[key]));

const execTestSuite = (title, testSuiteFn) => {
  log(indentedTitle(title));
  stack.push(newTop(title));
  testSuiteFn.call(ctx);   // collect testSuites, setup, teardown and it.
  execTop();               // execute them
  stack.pop();
};

const reportTests = (fn, title) => {
  const desc = indentedTitle(title);
  
  if(fn.length >= 1) {
    /*Async tests*/
    var done = function(err) {
      if(err) {
        failure(desc,err.message);
      } else {
        success(desc);
      }
    }
    try {
      fn.call(ctx,done)
    } catch(e) {
      failure(desc,e.message);
    }

    /*End async tests*/
  } else {
      try {
      fn.call(ctx);
      success(desc);
    } catch (e) {
      failure(desc, e.message);
    }
  }
  
};

activity.setup = fn => fn.call(ctx);
activity.teardown = fn => fn.call(ctx);
activity.testSet = ([title,testFn,type]) => {
  if(type == 'testSuites') {
    execTestSuite(title, testFn);
  } else if(type == 'tests') {
    reportTests(testFn, title);
  }
}
activity.testSuites = ([title, testFn]) =>
  execTestSuite(title, testFn);
activity.tests = ([title, testFn]) =>
  reportTests(testFn, title);

export const test = (desc, fn) => spush('testSet', [desc, fn,'tests']);
export const testSuite = (title, testfn) => {
  if (isEmptyStack()) {
    execTestSuite(title, testfn);
    return;
  }

  spush('testSet', [title, testfn, 'testSuites']);
};
export const setup = spush.bind(null, 'setup');
export const teardown = spush.bind(null, 'teardown');
