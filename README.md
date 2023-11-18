# markdown-it-conversation

A [markdown-it](https://github.com/markdown-it/markdown-it) plugin for wrapping a conversation with a custom Vue component. For use with Vuepress.

I find this preferable to using a Vue component / [named Markdown slot](https://vuepress.vuejs.org/guide/markdown-slot.html) directly in the Vuepress markdown file, as the conversation can be reformatted prior to rendering by SSR.

## Usage

<a name="ConversationPlugin"></a>

## ConversationPlugin
**Kind**: global class  
**Summary**: Wraps list in a Vue component and reformats contents  
**Access**: public  
<a name="new_ConversationPlugin_new"></a>

### new ConversationPlugin(options)

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| options | <code>object</code> |  | Instance options |
| [options.conversationClass=] | <code>string</code> |  | CSS class hook for styling the conversation wrapper |
| [options.conversationTag] | <code>string</code> | <code>&quot;Conversation&quot;</code> | Tag name for the conversation wrapper (or name of the Vue component, authored separately) |
| [options.icons] | <code>Array</code> |  | Array of country icon objects (obj.code, obj.title, obj.icon) |


### Example

```js
// .vuepress/config.js

module.exports = {
  markdown: {
    extendMarkdown: md => {
      md.use(require('markdown-it-conversation'), {
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
      })
    }
  }
}
```

```vue
// .vuepress/components/Conversation.vue (simplified example)

<template>
  <div class="conversation">
    <slot/>
  </div>
</template>

<script>
export default {
  name: 'Conversation',
}
</script>
```

#### Input markdown

```md
1. > **Zirka (MN):** It's name, it's?
1. > **Dan (NZ):** Cow? Ah, oh! Hair! Hair? Hair?
1. > **Zirka (MN):** H-he-hairr..
1. > **Dan (NZ):** Hair.
```

#### Output HTML

```html
<Conversation class=""><ol>
<li class="wpdtrt-conversation__exchange">
<blockquote class="wpdtrt-conversation__speaker">
<cite class="wpdtrt-conversation__name">
Zirka
<img src="/site/.vuepress/theme/images/flaticon/mongolia.svg" alt="Mongolia.">
</cite>
<p class="wpdtrt-conversation__speech">
<span class="wpdtrt-conversation__speech-liner">It's name, it's?</span>
</p>
</blockquote>
</li>
<li class="wpdtrt-conversation__exchange">
<blockquote class="wpdtrt-conversation__speaker">
<cite class="wpdtrt-conversation__name">
Dan
<img src="/site/.vuepress/theme/images/flaticon/new-zealand.svg" alt="New Zealand.">
</cite>
<p class="wpdtrt-conversation__speech">
<span class="wpdtrt-conversation__speech-liner">Cow? Ah, oh! Hair! Hair? Hair?</span>
</p>
</blockquote>
</li>
<li class="wpdtrt-conversation__exchange">
<blockquote class="wpdtrt-conversation__speaker">
<cite class="wpdtrt-conversation__name">
Zirka
<img src="/site/.vuepress/theme/images/flaticon/mongolia.svg" alt="Mongolia.">
</cite>
<p class="wpdtrt-conversation__speech">
<span class="wpdtrt-conversation__speech-liner">H-he-hairr..</span>
</p>
</blockquote>
</li>
<li class="wpdtrt-conversation__exchange">
<blockquote class="wpdtrt-conversation__speaker">
<cite class="wpdtrt-conversation__name">
Dan
<img src="/site/.vuepress/theme/images/flaticon/new-zealand.svg" alt="New Zealand.">
</cite>
<p class="wpdtrt-conversation__speech">
<span class="wpdtrt-conversation__speech-liner">Hair.</span>
</p>
</blockquote>
</li>
</ol>
</Conversation>
```
