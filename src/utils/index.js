export async function wait(sec) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve();
    }, 1000 * sec);
  });
}
