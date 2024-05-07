export const getGitDetails = async (userName, repoName) => {
  try {
    const response = await fetch(
      `https://api.github.com/repos/${userName}/${repoName}`
    );
    if (response.status !== 200) throw Error("No repo found!");
    return response.json();
  } catch (e) {
    console.error(e);
    throw Error("Error getting git details");
  }
};

export const getUserRepoName = (giturl) => {
  const girURLSplitArr = giturl.split("/");
  const length = girURLSplitArr.length;
  if (length < 1) throw Error("Not a valid github url");
  return [
    girURLSplitArr[length - 2],
    girURLSplitArr[length - 1]?.replace(".git", ""),
  ];
};
