// moonbit语法高亮
(function (Prism) {
  const keywords = [
    'fn', 'let', 'mut', 'pub',
    'if', 'else', 'match',
    'for', 'in', 'while', 'loop',
    'break', 'continue', 'return',
    'struct', 'enum', 'type',
    'trait', 'impl',
    'import', 'module', 'use', 'extern'
  ];

  const builtinTypes = [
    'Int', 'Int64', 'Int32', 'Int16', 'Int8',
    'UInt', 'UInt64', 'UInt32', 'UInt16', 'UInt8',
    'Float', 'Float64', 'Float32',
    'Bool', 'Char', 'String', 'Unit',
    'Option', 'Result', 'Bytes'
  ];

  Prism.languages.moonbit = Prism.languages.extend('clike', {
    // 文档注释
    'doc-comment': {
      pattern: /\/\/\/.*/,
      greedy: true
    },

    // 普通注释
    'comment': [
      {
        pattern: /\/\/.*/,
        greedy: true
      },
      {
        pattern: /\/\*[\s\S]*?\*\//,
        greedy: true
      }
    ],

    // 字符串
    'string': {
      pattern: /"(?:\\.|[^"\\])*"/,
      greedy: true
    },

    // 字符
    'char': {
      pattern: /'(?:\\.|[^'\\])'/,
      greedy: true
    },

    // 注解 / Attribute
    'attribute': {
      pattern: /@[a-zA-Z_]\w*/,
      alias: 'builtin'
    },

    // 关键字
    'keyword': new RegExp('\\b(' + keywords.join('|') + ')\\b'),

    // 内建类型
    'builtin-type': {
      pattern: new RegExp('\\b(' + builtinTypes.join('|') + ')\\b'),
      alias: 'class-name'
    },

    // 布尔 / 空
    'boolean': /\b(true|false)\b/,
    'null': /\b(null)\b/,

    // 数字
    'number': /\b\d+(\.\d+)?\b/,

    // 泛型 <T, U>
    'generic': {
      pattern: /[<]\s*[A-Z][\w\s,]*]/,
      alias: 'class-name'
    },

    // 类型注解 : Type
    'type-annotation': {
      pattern: /:\s*[A-Z][\w<>]*/,
      greedy: true,
      alias: 'class-name'
    },

    // 函数名
    'function': {
      pattern: /\bfn\s+([a-zA-Z_]\w*)/,
      lookbehind: true
    },

    // 构造器 / enum variant（首字母大写）
    'constructor': {
      pattern: /\b[A-Z][A-Za-z0-9_]*\b/,
      alias: 'class-name'
    },

    // 操作符
    'operator': /=>|->|\|>|\|\||&&|==|!=|<=|>=|[+\-*/%<>=!]/,

    // 标点
    'punctuation': /[{}()[\];,.:|]/
  });

})(Prism);
