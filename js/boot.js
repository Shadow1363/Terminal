async function bootScreen(version) {
  const boot = document.getElementById("output");
  const logo = `
   ___           __  ___     ___        ______              _           __
  / _ \\___  ____/ /_/ _/__  / (_)__    /_  __/__ ______ _  (_)__  ___ _/ /
 / ___/ _ \\/ __/ __/ _/ _ \\/ / / _ \\    / / / -_) __/  ' \\/ / _ \\/ _ \`/ / 
/_/   \\___/_/  \\__/_/ \\___/_/_/\\___/   /_/  \\__/_/ /_/_/_/_/_//_/\\_,_/_/  
                                                                                    
Portfolio Terminal [Version ${version}]
(c) Open Source. https://github.com/Shadow1363/terminal

Type help to get started:
`;
  let pre = document.createElement("pre");
  pre.innerHTML = logo;
  pre.className = "glow";
  
  boot.appendChild(pre);
}
