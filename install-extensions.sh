#!/bin/bash
echo "Installing VSCode Extensions in batches..."
echo ""

echo "Batch 1/5: Installing basic extensions"
code --install-extension Google.arb-editor
code --install-extension danielgjackson.auto-dark-mode-windows
code --install-extension viablelab.capitalize
code --install-extension wmaurer.change-case
code --install-extension formulahendry.code-runner
code --install-extension streetsidesoftware.code-spell-checker
code --install-extension GitHub.copilot-chat
code --install-extension GitHub.copilot
code --install-extension jerriepelser.copy-markdown-as-html
echo "Batch 1/5 completed."
echo ""
read -p "Press Enter to continue..."

echo "Batch 2/5: Installing more extensions"
code --install-extension phplasma.csv-to-table
code --install-extension jianbingfang.dupchecker
code --install-extension bierner.emojisense
code --install-extension ginfuru.ginfuru-better-solarized-dark-theme
code --install-extension bierner.github-markdown-preview
code --install-extension wengerk.highlight-bad-chars
code --install-extension abusaidm.html-snippets
code --install-extension Zignd.html-css-class-completion
code --install-extension andersliu.insert-line-number
echo "Batch 2/5 completed."
echo ""
read -p "Press Enter to continue..."

echo "Batch 3/5: Installing Japanese and Markdown extensions"
code --install-extension ICS.japanese-proofreading
code --install-extension sifue.japanese-word-count
code --install-extension ritwickdey.LiveServer
code --install-extension bierner.markdown-footnotes
code --install-extension shd101wyy.markdown-preview-enhanced
code --install-extension yzane.markdown-pdf
code --install-extension yzhang.markdown-all-in-one
code --install-extension PKief.material-icon-theme
code --install-extension possan.nbsp-vscode
echo "Batch 3/5 completed."
echo ""
read -p "Press Enter to continue..."

echo "Batch 4/5: Installing development tools"
code --install-extension wraith13.open-in-github-desktop
code --install-extension christian-kohler.path-intellisense
code --install-extension esbenp.prettier-vscode
code --install-extension mechatroner.rainbow-csv
code --install-extension jinhyuk.replace-curly-quotes
code --install-extension Tyriar.sort-lines
code --install-extension shardulm94.trailing-spaces
code --install-extension davidanson.vscode-markdownlint
code --install-extension dbaeumer.vscode-eslint
echo "Batch 4/5 completed."
echo ""
read -p "Press Enter to continue..."

echo "Batch 5/5: Installing final extensions"
code --install-extension fabiospampinato.vscode-open-in-finder
code --install-extension mushan.vscode-paste-image
code --install-extension redhat.vscode-yaml
code --install-extension sleistner.vscode-fileutils
code --install-extension telesoho.vscode-markdown-paste-image
code --install-extension unifiedjs.vscode-mdx
code --install-extension wayou.vscode-todo-highlight
code --install-extension mosapride.zenkaku
echo "Batch 5/5 completed."
echo ""
read -p "Press Enter to continue..."

echo "All extensions have been installed!"
echo "You may need to restart VSCode for all extensions to take effect."
read -p "Press Enter to exit..."
