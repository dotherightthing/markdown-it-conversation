/**
 * @file index.js
 * @summary markdown-it-conversation
 * @description A markdown-it plugin for wrapping a conversation in a custom Vue component.
 * @see {@link https://github.com/markdown-it/markdown-it/issues/834#issue-1087866549} - new TokenConstructor
 * @see {@link https://github.com/markdown-it/markdown-it/issues/834#issuecomment-1001055989} - md.core.ruler.push
 * @see {@link https://github.com/markdown-it/markdown-it/issues/813#issuecomment-907311975} - state.tokens.splice
 * @see {@link https://github.com/markdown-it/markdown-it/blob/e843acc9edad115cbf8cf85e676443f01658be08/dist/markdown-it.js} - new state.Token
 */

/**
 * @class ConversationPlugin
 * @summary Wraps list in a Vue component and reformats contents
 * @param {object} options - Instance options
 * @param {string} [options.conversationClass=] - CSS class hook for styling the conversation wrapper
 * @param {string} [options.conversationTag=Conversation] - Tag name for the conversation wrapper (or name of the Vue component, authored separately)
 * @param {Array} [options.icons] - Array of country icon objects (obj.code, obj.title, obj.icon)
 * @public
 */

class ConversationPlugin {
    constructor(md, options) {
        this.md = md;
        this.options = Object.assign({
          conversationClass: '',
          conversationTag: 'Conversation',
          icons: [
            {
              code: '(MN)',
              title: 'Mongolia',
              icon: '/site/.vuepress/theme/images/flaticon/mongolia.svg'
            },
            {
              code: '(NZ)',
              title: 'New Zealand',
              icon: '/site/.vuepress/theme/images/flaticon/new-zealand.svg'
            }
          ]
        }, options);

        // Push new rule to the end of core chain, when all parser jobs done, but before renderer
        md.core.ruler.push('conversation', this.conversation.bind(this));
    }

    conversation(state) {
        const {
            conversationClass,
            conversationTag,
            icons
        } = this.options;

        const tokens = state.tokens;
        const conversations = [];
        const listItems = [];

        let conversation = null;
        let listItem = null;

        for (let i = 0; i < tokens.length; i++) {
            const token = tokens[i];
            
            if (token.type === 'ordered_list_open') { // 0
                if (tokens[i + 1] && (tokens[i + 1].type === 'list_item_open')) {
                    if (tokens[i + 2] && (tokens[i + 2].type === 'blockquote_open')) {
                        conversation = {};
                        conversation.tokenOpen = token;
                    }
                }
            }

            if (conversation) {
                if (token.type === 'list_item_open') { // 1
                    listItem = {};
                    listItem.tokenOpen = token;
                } else if (listItem && listItem.tokenOpen) {
                    if (token.type === 'blockquote_open') { // 2
                        listItem.blockquoteOpen = token;
                    } else if (token.type === 'paragraph_open') { // 3
                        listItem.paragraphOpen = token;
                    } else if (token.type === 'inline') { // 4
                        if (listItem.paragraphOpen) {
                            listItem.inline = token;

                            token.children.forEach(childToken => {
                                if (childToken.type === 'strong_open') {
                                    listItem.strongOpen = childToken;
                                } else if (childToken.type === 'strong_close') {
                                    listItem.strongClose = childToken;
                                } else if (childToken.type === 'text') {
                                    if (listItem.strongClose) {
                                        listItem.speech = childToken.content.trim();
                                        listItem.text2 = childToken;
                                    } else if (listItem.strongOpen) {
                                        listItem.text1 = childToken;

                                        const strongContent = childToken.content.trim();

                                        icons.forEach(icn => {
                                            const {
                                                code,
                                                title,
                                                icon
                                            } = icn;

                                            const splitAt = strongContent.indexOf(code);

                                            if (splitAt > -1) {
                                                listItem.speaker = strongContent.slice(0, splitAt).trim();
                                                listItem.countryTitle = title;
                                                listItem.countryIcon = icon;
                                            }
                                        });
                                    } else {
                                        listItem.text2 = childToken;
                                    }
                                } 
                            });
                        }
                    } else if (token.type === 'paragraph_close') { // 5
                        listItem.paragraphClose = token;
                    } else if (token.type === 'blockquote_close') { // 6
                        listItem.blockquoteClose = token;
                    } else if (token.type === 'list_item_close') { // 7
                        listItem.tokenClose = token;
                        listItems.push(listItem);
                    } else if (token.type === 'ordered_list_close') { // 29
                        conversation.tokenClose = token;
                        conversation.listItems = listItems;
                        conversations.push(conversation);
                    }
                }
            }
        }

        conversations.forEach(conversation => {
            const {
                tokenOpen,
                listItems,
                tokenClose
            } = conversation;

            if (!tokenOpen || !listItems || !tokenClose) {
                return;
            }

            let insertPosition;

            const vueTokenOpen = new state.Token('html_block', '', 0); // tag, type, nesting
            const vueTokenClose = new state.Token('html_block', '', 0); // tag, type, nesting

            vueTokenOpen.content = `<${conversationTag} class="${conversationClass}">`;
            insertPosition = state.tokens.indexOf(tokenOpen);
            state.tokens.splice(insertPosition, 0, vueTokenOpen);

            vueTokenClose.content = `</${conversationTag}>`;
            insertPosition = state.tokens.indexOf(tokenClose) + 1;
            state.tokens.splice(insertPosition, 0, vueTokenClose);

            listItems.forEach(listItem => {
                const {
                    tokenOpen,
                    blockquoteOpen,
                    paragraphOpen,
                    strongOpen,
                    speaker,
                    countryTitle,
                    countryIcon,
                    strongClose,
                    speech,
                    inline,
                    text1,
                    text2
                } = listItem;

                const citeToken = new state.Token('html_block', '', 1); // tag, type, nesting
                const speechLinerToken = new state.Token('html_block', '', 1); // tag, type, nesting

                tokenOpen.attrSet('class', 'wpdtrt-conversation__exchange');
                blockquoteOpen.attrSet('class', 'wpdtrt-conversation__speaker');             
                citeToken.content = `<cite class="wpdtrt-conversation__name">
${speaker}
<img src="${countryIcon}" alt="${countryTitle}.">
</cite>
`;
                speechLinerToken.content = `
<span class="wpdtrt-conversation__speech-liner">${speech}</span>
`;

                insertPosition = state.tokens.indexOf(blockquoteOpen) + 1;
                state.tokens.splice(insertPosition, 0, citeToken);

                paragraphOpen.attrSet('class', 'wpdtrt-conversation__speech');

                strongOpen.hidden = true;
                strongClose.hidden = true;   
                text1.content = ''; // speech
                text2.content = ''; // speaker

                inline.children.unshift(speechLinerToken);
            });
        });
    }
}

module.exports = (md, options = {}) => new ConversationPlugin(md, options);
