const repo = "ryuzo-k/yomira";
const repoUrl = `https://github.com/${repo}`;
const skillsCommand = `npx skills add ${repo}`;
const isJapanese = document.documentElement.lang === "ja";

const installPrompt = isJapanese ? `Mora を open skills ecosystem から導入してください。

次のコマンドを実行してください。

${skillsCommand}

どのエージェントに導入するか聞かれた場合は、現在使っている環境を選んでください。

導入後は、私の現在の文脈から選択肢を抽出し、抜けている選択肢を補い、推奨する前に一貫した候補パスとして整理してください。

Source:
${repoUrl}` : `Install Mora from the open skills ecosystem.

Run this command:

${skillsCommand}

If the command asks which agent to install for, choose the current environment.

After installing, use it to extract my current options, expand the missing alternatives, and map coherent candidate paths before recommending one.

Source:
${repoUrl}`;

function copyText(text, button) {
  navigator.clipboard.writeText(text.trim()).then(() => {
    const previous = button.textContent;
    button.textContent = "Copied";
    window.setTimeout(() => {
      button.textContent = previous;
    }, 1200);
  });
}

document.querySelector("#install-prompt").textContent = installPrompt;

document.querySelector("#copy-install-prompt")?.addEventListener("click", (event) => {
  copyText(installPrompt, event.currentTarget);
});

document.querySelector("#copy-skills-command")?.addEventListener("click", (event) => {
  copyText(skillsCommand, event.currentTarget);
});
