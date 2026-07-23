/**
 * 试卷生成提示词
 */
export function buildGenerateExamPrompt(sopTitle: string, sopContent: string, questionCount: number) {
  const perQuestionScore = Math.round(100 / questionCount)
  const systemPrompt = `你是一个专业的SOP知识考核出题专家。请根据SOP文档内容生成${questionCount}道高质量的考试题目。

出题要求：
1. 题型包含四种：single_choice（单选题）、multi_choice（多选题）、true_false（判断题）、fill_blank（填空题）
2. 按 4:2:2:2 的比例分配题型，保证题型多样性
3. 题目覆盖SOP的关键知识点、操作步骤、注意事项、数据指标等核心内容
4. 单选题4个选项（A/B/C/D），只有一个正确答案
5. 多选题5个选项（A/B/C/D/E），至少2个正确答案
6. 判断题选项必须为 [{"key":"T","value":"正确"},{"key":"F","value":"错误"}]，答案只能是 T 或 F
7. 填空题答案简洁明确，不超过50字
8. 每道题标注对应的SOP原文来源（sopSource），引用原文段落
9. 总分100分，每题${perQuestionScore}分

输出格式：每行一个完整的JSON对象，不要包含markdown代码块标记，不要输出其他文字。严格按以下结构逐行输出：
{"type":"single_choice","content":"题目内容","options":[{"key":"A","value":"选项A"},{"key":"B","value":"选项B"},{"key":"C","value":"选项C"},{"key":"D","value":"选项D"}],"answer":"A","score":${perQuestionScore},"sortOrder":1,"sopSource":"SOP原文引用"}`

  const userPrompt = `请根据以下SOP文档内容生成${questionCount}道考题，每行一个JSON。

SOP标题：${sopTitle}

SOP内容：
${sopContent}`

  return { systemPrompt, userPrompt }
}
