import chalk from 'chalk';
import {constants} from '~config/constants';


async function requestLogger({request, code, set, user}: any) {
  if (Bun.env.NODE_ENV === 'development') {
    let coloredMethod;
    switch (request.method) {
      case 'GET':
        coloredMethod = chalk.green(request.method);
        break;
      case 'DELETE':
        coloredMethod = chalk.red(request.method);
        break;
      default:
        coloredMethod = chalk.yellowBright(request.method);
        break;
    }
    console.info(
      coloredMethod,
      chalk.yellow('--'),
      request.url.replace(`http://localhost:${Bun.env.PORT}`, ''),
      chalk.yellow('--'),
      code
        ? chalk.bgRedBright(code)
        : set.status === 200
        ? chalk.bgGreen(set.status)
        : set.status === 300
        ? chalk.bgYellowBright(chalk.black(set.status))
        : chalk.bgRedBright(chalk.black(set.status)),
      new Date(),
      user ?? 'Visitor'
    );
    

  }
}

function bootLogger({ hostname, server }:any) {
  // console.log(ctx.hostname);
  const time = new Date().toLocaleTimeString();
    
  if (Bun.env.NODE_ENV === 'development') {
    console.log(
      `💻 ${time}: ${chalk.yellow(`${constants.server.name} Dev Server`)} running on`,
      chalk.blueBright((hostname||'local')+':') +
        chalk.greenBright(Bun.env.PORT)
    );
  } else if (Bun.env.NODE_ENV === 'production') {
    console.log(
      `🖥️ ${time}: ${chalk.greenBright(`${constants.server.name} Server`)} running.`,
      chalk.blueBright((hostname)+':') +
        chalk.greenBright(Bun.env.PORT || 3000)
    );
  }
}

const gracefulShutdown = async () => {
  console.log(chalk.yellowBright('shutting down gracefully (5 seconds) ....'));
  // disconnet DB and other services...
  setTimeout(() => {
    console.log('good bye');
    process.exit();
  }, 5000);
};

export { requestLogger, bootLogger, gracefulShutdown };