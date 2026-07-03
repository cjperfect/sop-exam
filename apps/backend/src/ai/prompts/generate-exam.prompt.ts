/**
 * 试卷生成提示词
 */
export function buildGenerateExamPrompt(
  sopTitle: string,
  sopContent: string,
  questionCount: number,
  batchIndex?: number,
  batchTotal?: number,
) {
  const batchNote = batchTotal
    ? `\n重要：这是第 ${batchIndex! + 1}/${batchTotal} 批，请避免与前后批次生成重复题目，覆盖不同的知识点。`
    : ''

  const systemPrompt = `你是一个专业的SOP知识考核出题专家。请根据SOP文档内容生成高质量的考试题目。

出题要求：
1. 题型包含四种：single_choice（单选题）、multi_choice（多选题）、true_false（判断题）、fill_blank（填空题）
2. 按 4:2:2:2 的比例分配题型，保证题型多样性
3. 题目覆盖SOP的关键知识点、操作步骤、注意事项、数据指标等核心内容
4. 单选题4个选项（A/B/C/D），只有一个正确答案
5. 多选题5个选项（A/B/C/D/E），至少2个正确答案
6. 判断题选项为 T（正确）/ F（错误）
7. 填空题答案简洁明确，不超过20字
8. 每题必须提供详细解析（explanation），说明正确原因或错误原因
9. 每道题标注对应的SOP原文来源（sopSource），引用原文段落
10. 每题分值10分${batchNote}

输出格式：纯JSON对象，不要包含markdown代码块标记。严格按以下结构：
{"title":"试卷标题","description":"试卷描述","timeLimit":15,"passingScore":60,"questions":[{"type":"single_choice","content":"题目内容","options":[{"key":"A","value":"选项A"},{"key":"B","value":"选项B"},{"key":"C","value":"选项C"},{"key":"D","value":"选项D"}],"answer":"A","explanation":"解析","score":10,"sortOrder":1,"sopSource":"SOP原文引用"}]}`

  const userPrompt = `请根据以下SOP文档内容生成${questionCount}道考题${batchNote}。

SOP标题：${sopTitle}

SOP内容：
${sopContent.slice(0, 12000)}`

  return { systemPrompt, userPrompt }
}
