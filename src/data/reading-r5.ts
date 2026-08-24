import type { ReadingArticle } from '@/models/reading'

export const READING_R5_META = {
  code: 'R5',
  title: '增補資料 R5 字彙',
  source: 'Popular Science',
  author: '旋元佑',
  articleCount: 4,
  wordCount: 307,
}

export const READING_R5: ReadingArticle[] = [
  {
    id: 1,
    title: 'We smell different as we age. Here’s why.',
    author: 'Jennifer Byrne',
    topic: 'Popular Science',
    content: `We’ve all heard the saying: As we age, supposedly, we begin to develop a certain … telltale odor. Some describe it as evocative of a cozy grandparents’ house, old furniture, or closets full of vintage clothing. Others swear they can detect it on a person directly—picking up a musty, grassy, and unmistakable aroma.

So, does aging really come with a smell of its own?

According to Dr. Sonal Choudhary, a dermatologist and assistant professor of dermatology at the University of Pittsburgh, some aspects of this distinct smell really do come down to biology. But teasing apart what’s actually coming from a person’s skin versus what stems from environment, memory, or association is trickier than you might expect.

“The biggest misconception is that this [smell] reflects poor hygiene,” Choudhary says. “In reality, aging skin undergoes predictable biochemical changes that can alter body odor, even in people with excellent hygiene.”

## A chemical compound tells some (but not all) of the story

Stale attics and moth-eaten sweaters aside, there is a specific, identifiable chemical signature behind the stereotype of “old person smell,” according to Choudhary.

“2-nonenal is a naturally occurring, odor-producing molecule that forms when certain fats on the skin surface undergo oxidation,” Choudhary says. “As we age, changes in skin chemistry,” she says, “make this reaction more likely.”

Interestingly, though, the compound doesn’t necessarily increase steadily with age.

“Some studies suggest that 2-nonenal begins increasing around middle age and may plateau or vary considerably between individuals rather than steadily rising throughout life,” Choudhary says.

In one study conducted at Monell Chemical Senses Center, researchers had people sniff underarm odor samples across age groups. They found that middle-aged men were rated as smelling the worst, while the smell of older participants was rated as less unpleasant.

That finding hints at something important: that the “old person smell” stereotype may be tracking something other than pure chemistry. In fact, Choudhary says, the notorious smell is as related to context, lifestyle changes, and even interpretation as it is to a single compound.

“Older adults may accumulate other factors that influence body odor, such as medications, chronic illnesses, reduced mobility, changes in hygiene practices or living environments,” she says. “In other words, ‘old person smell’ is probably a combination of biology and context rather than a single chemical marker.”

Specifically, medications like antidepressants, diabetes medications, and supplements can alter sweat and body odor.

Diet can have an impact, too. Foods, such as garlic, onions, alcohol, and certain spices, can change a body’s smell in some people—regardless of age. Changes in clothing fabrics, laundry practices, and personal hygiene also play important roles, says Choudhary.

“Age is just one piece of a much larger picture.”

## We smell what we expect to smell

Even accounting for all of that, Choudhary says there’s a tendency to oversimplify the phenomenon as attributable to a single culprit. Although it might be satisfying to have a chemical compound to name (and blame) for age-associated odors, the truth is likely much more complex.

“While 2-nonenal has received the most attention because it was one of the first age-associated odor compounds identified, body odor results from a complex interaction among skin oils, sweat, the skin microbiome, oxidative processes, medications, diet, health conditions, and environmental factors,” she says.

“Reducing the conversation to one chemical misses much of the underlying biology.”

Choudhary adds that at least some of what we’re smelling can be attributed to something much more subjective: our memories and associations.

“Human perception of odor is influenced not only by chemistry, but also by memory, culture, and learned associations,” she says. “We often associate particular scents with grandparents, nursing homes, older furniture, certain soaps, mothballs, or living environments, and those associations can shape how we interpret someone’s scent.”

Although gradual changes in body scent usually aren’t cause for concern, Choudhary cautions that pronounced or abrupt changes in odor might be worth mentioning to a doctor to rule out underlying problems.

“A sudden or dramatic change, especially if accompanied by weight loss, fever, excessive sweating, changes in urination, or other new symptoms, should be evaluated,” she says.

“New body odor can occasionally be an early clue to an underlying medical condition or medication side effect. In those situations, it’s worth bringing up with your healthcare provider rather than assuming it’s simply due to age.”

## How to avoid “smelling old”

Although it’s sadly not possible to alter other people’s perceptions, memories, or contexts around aging bodies, there are some simple ways to minimize your own body’s scent, Choudhary says.

Choudhary’s advice for managing it is refreshingly ordinary: cleanse gently, wash clothes often, and moisturize to keep the skin barrier healthy. Eating foods rich in antioxidants (think berries, dark leafy greens, and beans) might help too, at least in theory: The research isn’t there yet to say for sure that antioxidant skincare actually reduces 2-nonenal.

In fact, there’s currently no universally accepted treatment that specifically reduces 2-nonenal. But don’t panic: You’re not resigned to a future of unwittingly committing this olfactory party foul. Fortunately, there are ways to minimize body odor, and the preventive measures are the same as for almost any health-related goal.

“Managing chronic medical conditions, staying hydrated, maintaining a balanced diet, and treating excessive sweating when present can also help,” says Choudhary.

In other words: soap, water, and patience can go a long way. No fancy antioxidant serum required. And as for the other associations—the attics, the mothballs, the closets —they likely have nothing to do with how you smell. Someone is probably just really missing their grandma.`,
    words: [
      { word: 'telltale', pos: 'a.', zh: '泄露秘密的' },
      { word: 'odor', pos: 'n.', zh: '氣味' },
      { word: 'describe', pos: 'v.', zh: '描述' },
      { word: 'evocative', pos: 'a.', zh: '令人想起…' },
      { word: 'cozy', pos: 'a.', zh: '舒適的' },
      { word: 'closet', pos: 'n.', zh: '櫥櫃', match: ['closets'] },
      { word: 'vintage', pos: 'a.', zh: '陳年的' },
      { word: 'detect', pos: 'v', zh: '偵測' },
      { word: 'aroma', pos: 'n.', zh: '氣味' },
      { word: 'dermatologist', pos: 'n.', zh: '皮膚科專家' },
      { word: 'aspect', pos: 'n.', zh: '面向', match: ['aspects'] },
      { word: 'distinct', pos: 'a.', zh: '獨特的' },
      { word: 'tease apart', pos: 'ph.', zh: '釐清' },
      { word: 'stem from', pos: 'ph.', zh: '出自於' },
      { word: 'association', pos: 'n.', zh: '聯想' },
      { word: 'tricky', pos: 'a.', zh: '棘手，易出錯' },
      { word: 'misconception', pos: 'n.', zh: '錯誤觀念' },
      { word: 'reflect', pos: 'v.', zh: '反映', match: ['reflects'] },
      { word: 'hygiene', pos: 'n.', zh: '衛生' },
      { word: 'predictable', pos: 'a.', zh: '可預料的' },
      { word: 'alter', pos: 'v.', zh: '改變' },
      { word: 'stale', pos: 'a.', zh: '陳舊的' },
      { word: 'attic', pos: 'n.', zh: '閣樓' },
      { word: 'moth', pos: 'n.', zh: '蛾' },
      { word: 'identifiable', pos: 'a.', zh: '可以辨認的' },
      { word: 'stereotype', pos: 'n.', zh: '刻板印象' },
      { word: 'occur', pos: 'v.', zh: '產生' },
      { word: 'molecule', pos: 'n.', zh: '分子' },
      { word: 'oxidation', pos: 'n.', zh: '氧化' },
      { word: 'compound', pos: 'n.', zh: '化合物' },
      { word: 'plateau', pos: 'v.', zh: '達到高原期' },
      { word: 'vary', pos: 'v.', zh: '變化' },
      { word: 'considerably', pos: 'adv.', zh: '大程度地' },
      { word: 'individual', pos: 'n.', zh: '個人', match: ['individuals'] },
      { word: 'conduct', pos: 'v.', zh: '領導，進行', match: ['conducted'] },
      { word: 'sniff', pos: 'v.', zh: '嗅' },
      { word: 'rate', pos: 'v.', zh: '評分', match: ['rated'] },
      { word: 'participant', pos: 'n.', zh: '參與者', match: ['participants'] },
      { word: 'hint', pos: 'v.', zh: '暗示', match: ['hints'] },
      { word: 'track', pos: 'v.', zh: '追蹤', match: ['tracking'] },
      { word: 'notorious', pos: 'a.', zh: '惡名昭彰的' },
      { word: 'context', pos: 'n.', zh: '背景，環境' },
      { word: 'interpretation', pos: 'n.', zh: '詮釋' },
      { word: 'adult', pos: 'n.', zh: '成人', match: ['adults'] },
      { word: 'accumulate', pos: 'v.', zh: '累積' },
      { word: 'factor', pos: 'n.', zh: '因素', match: ['factors'] },
      { word: 'chronic', pos: 'a.', zh: '慢性的' },
      { word: 'mobility', pos: 'n.', zh: '機動性' },
      { word: 'specifically', pos: 'adv.', zh: '明確地說', match: ['Specifically'] },
      { word: 'antidepressant', pos: 'n.', zh: '抗憂鬱劑', match: ['antidepressants'] },
      { word: 'diabetes', pos: 'n.', zh: '糖尿病' },
      { word: 'supplement', pos: 'n.', zh: '補充劑', match: ['supplements'] },
      { word: 'diet', pos: 'n.', zh: '飲食', match: ['Diet'] },
      { word: 'impact', pos: 'n.', zh: '衝擊' },
      { word: 'garlic', pos: 'n.', zh: '大蒜' },
      { word: 'onion', pos: 'n.', zh: '洋蔥', match: ['onions'] },
      { word: 'alcohol', pos: 'n.', zh: '酒精' },
      { word: 'fabric', pos: 'n.', zh: '布料', match: ['fabrics'] },
      { word: 'laundry', pos: 'n.', zh: '洗衣' },
      { word: 'account for', pos: 'ph.', zh: '將…列入考慮' },
      { word: 'tendency', pos: 'n.', zh: '傾向' },
      { word: 'phenomenon', pos: 'n.', zh: '現象' },
      { word: 'attributable to', pos: 'ph.', zh: '可歸因於' },
      { word: 'culprit', pos: 'n.', zh: '元兇，罪魁禍首' },
      { word: 'identify', pos: 'v.', zh: '辨認', match: ['identified'] },
      { word: 'microbiome', pos: 'n.', zh: '微生物群' },
      { word: 'subjective', pos: 'a.', zh: '主觀的' },
      { word: 'perception', pos: 'n.', zh: '觀察，認知' },
      { word: 'scent', pos: 'n.', zh: '氣味', match: ['scents'] },
      { word: 'nursing home', pos: 'ph.', zh: '養老院' },
      { word: 'mothball', pos: 'n.', zh: '樟腦 丸', match: ['mothballs'] },
      { word: 'caution', pos: 'v.', zh: '警告', match: ['cautions'] },
      { word: 'pronounced', pos: 'a.', zh: '明顯的' },
      { word: 'abrupt', pos: 'a.', zh: '突然的' },
      { word: 'rule out', pos: 'ph.', zh: '排除' },
      { word: 'dramatic', pos: 'a.', zh: '戲劇化的' },
      { word: 'accompany', pos: 'v.', zh: '伴隨', match: ['accompanied'] },
      { word: 'excessive', pos: 'a.', zh: '過度的' },
      { word: 'urination', pos: 'n.', zh: '小便' },
      { word: 'symptom', pos: 'n.', zh: '症狀', match: ['symptoms'] },
      { word: 'evaluate', pos: 'v.', zh: '評估', match: ['evaluated'] },
      { word: 'occasionally', pos: 'adv.', zh: '偶爾' },
      { word: 'clue', pos: 'n.', zh: '線索' },
      { word: 'side effect', pos: 'ph.', zh: '副作用' },
      { word: 'assume', pos: 'v.', zh: '假設' },
      { word: 'minimize', pos: 'v.', zh: '最小化' },
      { word: 'advice', pos: 'n.', zh: '建議，忠告' },
      { word: 'refreshingly', pos: 'adv.', zh: '令人耳目一新地' },
      { word: 'cleanse', pos: 'v.', zh: '清潔' },
      { word: 'moisturize', pos: 'v.', zh: '保濕，補水' },
      { word: 'barrier', pos: 'n.', zh: '屏障' },
      { word: 'antioxidant', pos: 'n.', zh: '抗氧化劑', match: ['antioxidants'] },
      { word: 'berry', pos: 'n.', zh: '莓果', match: ['berries'] },
      { word: 'currently', pos: 'adv.', zh: '目前' },
      { word: 'universally', pos: 'adv.', zh: '普遍地' },
      { word: 'panic', pos: 'v.', zh: '驚慌' },
      { word: 'resigned', pos: 'a.', zh: '放棄，認命' },
      { word: 'unwittingly', pos: 'adv.', zh: '無意間，在不知情的情況下' },
      { word: 'commit', pos: 'v.', zh: '犯（罪）/ olfactory (a.) 嗅覺的' },
      { word: 'foul', pos: 'n.', zh: '犯規' },
      { word: 'preventive', pos: 'a.', zh: '預防的' },
      { word: 'goal', pos: 'n.', zh: '目標' },
      { word: 'maintain', pos: 'v.', zh: '維持', match: ['maintaining'] },
      { word: 'balanced', pos: 'a.', zh: '均衡的' },
      { word: 'patience', pos: 'n.', zh: '耐心' },
      { word: 'go a long way', pos: 'ph.', zh: '很有用' },
      { word: 'fancy', pos: 'a.', zh: '新奇的' },
      { word: 'serum', pos: 'n.', zh: '精華液，血清' },
    ],
  },
  {
    id: 2,
    title: 'Dogs can tell if you’re angry, scared, or sad',
    author: 'Tom Hawking',
    topic: 'Popular Science',
    content: `Spend any time with a dog, and it’s clear many have a remarkable ability to understand how we’re feeling. But while there are endless anecdotes of empathetic dogs coming to comfort us when we’re sad and barking happily when we’re feeling good, actual hard scientific evidence of the extent to which dogs really understand human emotion is surprisingly thin on the ground. This is because ultimately, we can never know what it’s like to be a dog—and sadly, we can’t just ask them. In the famous words of British veterinarian and author James Alfred Wight (better known by his pen name James Herriot): if only they could talk.

Nevertheless, scientists are slowly developing a more sophisticated understanding of the ways that dogs relate to us. Multiple recent studies have provided strong evidence that dogs can respond to human facial cues and distinguish between human facial expressions. Now, a study, published today in the journal iScience, has found evidence that dogs appear to be able to make such distinctions on a more sophisticated level than simply understanding “positive” or “negative”.

“Previous behavioral studies [in dogs] have compared faces expressing a negative emotion with faces expressing a positive emotion,” study co-author and psychologist Laura Verónica Cuaya-Retana from Mexico’s National Autonomous University, explains to Popular Science.

This study takes our understanding of how well canines interpret our emotions a step further than comparing the differing nature of how a dog’s brain responds to witnessing positive and negative emotions in humans. It also examines whether seeing differing emotions within those categories elicited different cerebral responses.

To carry out the research, the team placed eight different dogs within a fMRI (functional magnetic resonance imaging) machine. For the record, these were very, very good dogs.

“The dogs participated awake, unrestrained, and remained still voluntarily in the fMRI scanner after gradual training,” Cuaya-Retana says. “The study was possible thanks to [the dogs’] cooperation and that of their families.”

While in the fMRI machine, the dogs were shown photos of the same person expressing three negative emotions—fear, anger and sadness—as well as one positive emotion, happiness. The researchers then examined activity in the animals’ brains in response to each image.

They found that anger, fear, and sadness appeared to stimulate different areas of the dogs’ brains. Interestingly, while the dogs displayed differing responses to fear and anger, and to fear and sadness, they did not seem able to differentiate anger and sadness.

“This is the first evidence in general that the dog brain can distinguish between some human facial expressions within the same [category]. This suggests more detailed processing [than simply positive or negative],” Cuaya-Retana explains.

Familiarity also appears to be a key factor in a dog’s understanding of human emotional cues. For this reason, the team showed the dogs images of strangers.

“We do know that experience influences dogs’ ability to discriminate emotions, and that familiarity is highly relevant to how the dog brain processes faces,” says Cuaya-Retana. “For this reason, we presented faces of strangers, allowing us to test whether brain responses differed according to facial expression rather than familiarity.”

According to the team, these robust results are particularly striking because, like humans, dogs take their cues from many sources in addition to facial expressions.

“The dogs viewed static images of unfamiliar people, without voices, body movements, odors, or context … [and] even under these restricted conditions, we found a robust brain representation of happy faces and evidence that some negative expressions were processed differently,” Cuaya-Retana says.

The results provide a tantalizing suggestion that our canine companions can identify our expressions for what they are—that their understanding seems to be more along the lines of, “This human is smiling, so they are in a positive emotional state,” than, “This human’s emotional state appears more happy than it was five minutes ago.”

However, Cuaya-Retana cautions against anthropomorphizing these findings since we can’t truly access a dog’s subjective experience.

“Our results suggest that dogs’ brains can differentiate between some facial expressions as distinct categories, rather than merely detecting that one expression is more positive or negative than another,” she explains. “The evidence goes beyond dogs simply detecting whether their caregiver is pleased or displeased with them. Still, we cannot conclude that dogs understand/experience emotions in the same conceptual way that humans do.”

Using three negative emotions and one positive one also raises an interesting question. Is it reasonable to expect that the same sorts of results would arise from multiple positive expressions? Cuaya-Retana says, “Yes, … but it still needs to be tested.”

While the nature of dogs’ understanding of our emotions is fascinating in and of itself, Cuaya-Retana suggests this study could also help us understand the development of our own responses to emotional cues. “Studying the dog brain can also help us understand the evolution of social brain networks,” she says. “Humans and dogs are evolutionarily distant species with very different brains, yet both are sensitive to human emotional signals. Comparing how each species processes these cues can reveal which neural solutions evolved independently and which may reflect more general principles of social cognition.”

There’s also one final unanswered question here. Cuaya-Retana says that dogs may take their cues more from non-visual sources. The most obvious cue is scent. While humans are visual creatures, relying first and foremost on our eyesight to understand the world, dogs rely on their peerless sense of smell.

Expanding research beyond visual cues is therefore one possible future direction for research.

“Future studies could include active tasks in which dogs respond to emotional cues, allowing us to connect brain activity with what they perceive, learn, and choose to do,” Cuaya-Retana says. “It would also be valuable to use more naturalistic and multimodal stimuli, and to incorporate the dogs’ perspective into the experimental design.”`,
    words: [
      { word: 'remarkable', pos: 'a.', zh: '了不起的' },
      { word: 'anecdote', pos: 'n.', zh: '軼聞，小故事', match: ['anecdotes'] },
      { word: 'empathetic', pos: 'a.', zh: '有同理心的' },
      { word: 'comfort', pos: 'v.', zh: '安慰' },
      { word: 'evidence', pos: 'n.', zh: '證據' },
      { word: 'extent', pos: 'n.', zh: '程度' },
      { word: 'emotion', pos: 'n.', zh: '情感' },
      { word: 'ultimately', pos: 'adv.', zh: '追根究柢' },
      { word: 'veterinarian', pos: 'n.', zh: '獸醫' },
      { word: 'sophisticated', pos: 'a.', zh: '複雜的，精密的' },
      { word: 'multiple', pos: 'a.', zh: '多重', match: ['Multiple'] },
      { word: 'provide', pos: 'v.', zh: '提供', match: ['provided'] },
      { word: 'cue', pos: 'n.', zh: '提示', match: ['cues'] },
      { word: 'distinguish', pos: 'v.', zh: '區分' },
      { word: 'facial expression', pos: 'ph.', zh: '表情' },
      { word: 'journal', pos: 'n.', zh: '期刊' },
      { word: 'distinction', pos: 'n.', zh: '區別，區 分', match: ['distinctions'] },
      { word: 'positive', pos: 'a.', zh: '正面' },
      { word: 'negative', pos: 'a.', zh: '負面' },
      { word: 'previous', pos: 'a.', zh: '先前的', match: ['Previous'] },
      { word: 'behavioral', pos: 'a.', zh: '行為的' },
      { word: 'co-author', pos: 'n.', zh: '共同作者' },
      { word: 'psychologist', pos: 'n.', zh: '心 理學家' },
      { word: 'autonomous', pos: 'a.', zh: '自主的，自治的', match: ['Autonomous'] },
      { word: 'canine', pos: 'n.', zh: '犬類', match: ['canines'] },
      { word: 'witness', pos: 'v.', zh: '目睹', match: ['witnessing'] },
      { word: 'category', pos: 'n.', zh: '類別', match: ['categories'] },
      { word: 'elicit', pos: 'v.', zh: '引出', match: ['elicited'] },
      { word: 'cerebral', pos: 'a.', zh: '大腦 的' },
      { word: 'unrestrained', pos: 'a.', zh: '未受限制' },
      { word: 'still', pos: 'a.', zh: '靜止' },
      { word: 'voluntarily', pos: 'adv.', zh: '自願地' },
      { word: 'scanner', pos: 'n.', zh: '掃描器' },
      { word: 'cooperation', pos: 'n.', zh: '合作' },
      { word: 'stimulate', pos: 'v.', zh: '刺激' },
      { word: 'display', pos: 'v.', zh: '表示出，展現出', match: ['displayed'] },
      { word: 'differentiate', pos: 'v.', zh: '區分' },
      { word: 'process', pos: 'v.', zh: '處理', match: ['processing'] },
      { word: 'familiarity', pos: 'n.', zh: '熟悉', match: ['Familiarity'] },
      { word: 'discriminate', pos: 'v.', zh: '區分' },
      { word: 'relevant', pos: 'a.', zh: '相關' },
      { word: 'present', pos: 'v.', zh: '提出，呈現', match: ['presented'] },
      { word: 'robust', pos: 'a.', zh: '強有力的' },
      { word: 'striking', pos: 'a.', zh: '令人印象深刻' },
      { word: 'view', pos: 'v.', zh: '看待', match: ['viewed'] },
      { word: 'static', pos: 'a.', zh: '靜止的' },
      { word: 'restricted', pos: 'a.', zh: '受限制的' },
      { word: 'representation', pos: 'n.', zh: '代表，呈現' },
      { word: 'tantalizing', pos: 'a.', zh: '誘人的' },
      { word: 'companion', pos: 'n.', zh: '同伴', match: ['companions'] },
      { word: 'identify', pos: 'v.', zh: '辨認' },
      { word: 'anthropomorphize', pos: 'v.', zh: '人格化，將…視為人類' },
      { word: 'access', pos: 'v.', zh: '接觸' },
      { word: 'subjective', pos: 'a.', zh: '主觀的' },
      { word: 'caregiver', pos: 'n.', zh: '照料者' },
      { word: 'conclude', pos: 'v.', zh: '下結論' },
      { word: 'conceptual', pos: 'a.', zh: '觀念式的' },
      { word: 'fascinating', pos: 'a.', zh: '迷人' },
      { word: 'evolution', pos: 'n.', zh: '演化' },
      { word: 'distant', pos: 'a.', zh: '遙遠的' },
      { word: 'sensitive', pos: 'a.', zh: '敏感' },
      { word: 'signal', pos: 'n.', zh: '訊號', match: ['signals'] },
      { word: 'reveal', pos: 'v.', zh: '透露' },
      { word: 'neural', pos: 'a.', zh: '神經的' },
      { word: 'solution', pos: 'n.', zh: '解決方案' },
      { word: 'cognition', pos: 'n.', zh: '認知' },
      { word: 'non-visual', pos: 'a.', zh: '非視覺的' },
      { word: 'peerless', pos: 'a.', zh: '無與倫比的' },
      { word: 'expand', pos: 'v.', zh: '擴大', match: ['Expanding'] },
      { word: 'task', pos: 'n.', zh: '任務，工作', match: ['tasks'] },
      { word: 'perceive', pos: 'v.', zh: '觀察' },
      { word: 'multimodal', pos: 'a.', zh: '多種模式的' },
      { word: 'stimuli', pos: 'n.', zh: '刺激，單 數為stimulus' },
      { word: 'incorporate', pos: 'v.', zh: '納入' },
      { word: 'perspective', pos: 'n.', zh: '觀點，視角' },
    ],
  },
  {
    id: 3,
    title: 'Why is heart cancer so rare?',
    author: 'Andrew Coletti',
    topic: 'Popular Science',
    content: `By a wide margin, the most common form of cancer is skin cancer. About one in five people will get skin cancer in their lifetime, compared to about one in 18 for lung cancer, and about one in 100 for liver cancer. However, only about one person out of every 50,000 will develop cancer of the heart. Even when heart cancer does occur, it’s 30 to 40 times more likely to be secondary, meaning that it spreads to the heart from somewhere else rather than starting there.

So what makes heart cancer so rare? The answer lies in the special characteristics that make the heart different from other organs in your body. Studies suggest that the heart may also hold clues as to how cancer forms and spreads in areas more likely to be affected.

## Cancer is caused by mutations

Cellular regeneration is one of the body’s most essential processes. It’s how we grow and stay healthy by replacing damaged cells with fresh ones. However, errors known as mutations can sometimes occur in the regeneration process that cause it to continue far beyond what is necessary for our health. When this kind of mutation is activated, new cells keep growing in excess, forming masses of tissue that drain the body’s resources and put strain on healthy organs. This harmful, uncontrolled growth is cancer.

While genetics and other factors play a role in how often cancer happens and where, cancer-causing mutations are more common overall in parts of the body with a high turnover of cells. The more cell regeneration, the higher the probability of error. This is why certain behaviors like smoking increase your risk of developing specific cancers. Smoking damages tissue in the lungs, throat, and mouth, which means more regeneration in those areas and more chance of a mutation there.

## How heart cells are different from other cells

Unlike many other organs, the heart is made of sturdy muscle tissue that grows and regenerates

very slowly, at a rate of about one percent per year. Less than half of the heart cells you are born with will be replaced naturally during your lifetime. Compare this with your skin, which fully regenerates all of its cells every 40 to 56 days.

Scientists believe that the low regeneration in the heart was an evolutionary trade-off. In exchange for the organ being durable and functional from an early age, the heart lost the ability to regenerate in mammals that it still has in some other animals, such as amphibians. In the words of one study, the human heart responds to damage with “repair as opposed to regeneration,” developing scar tissue rather than growing new, healthy cells.

The slow regeneration of heart cells is believed to be the major reason hearts rarely develop cancer. And when cancer spreads to the heart, it tends to grow more slowly there than in other affected areas. This is especially notable given that the bloodstream is one of the major pathways for cancerous cells to spread. Cancerous cells don’t affect the heart very often even when they travel directly through it.

## High pressure may help prevent cancer in the heart

One 2026 study suggests that the high pressure caused by the heart’s continual beating plays a role in keeping cancer from forming.

When the heart is functioning under less pressure than normal, its rate of cell regeneration increases. This can be observed in heart failure patients with an implant that relieves strain on their heart by helping pump blood through their bodies. We know that increased cellular regeneration in other areas of the body increases the chance of cancer developing. Could the same be true in the heart?

Researchers at the International Centre for Genetic Engineering and Biotechnology in Trieste, Italy, sought to determine whether a heart under less pressure is more likely to develop cancer. To find out, they transplanted hearts into mice that pumped less blood than normal, meaning they were under less pressure than normal and had more regeneration. Researchers then introduced cancer cells into the transplanted hearts as well as normal mouse hearts, and compared how quickly they spread.

Cancer cells spread more quickly in the hearts under lower pressure. Remarkably, researchers were able to link these changes to a specific protein affected by the heartbeat. In response to the physical force and pressure of the beating heart, this protein reduces the activity of genes connected with cancer growth.

The study could pave the way for new forms of cancer treatment. Devices that produce a pulse of pressure, imitating the heartbeat, could be used to slow down or halt the spread of cancer in specific targeted areas. Prototypes being tested for cancers close to the skin, such as breast cancer, show promising results.

## There might be more to the relationship between cancer and the heart

Because heart cancer is so rare, it has not been researched as extensively as some other cancers. However, some studies have proposed a direct connection between heart health and cancer in other areas of the body.

A 2026 analysis published in the Journal of the American Heart Association suggested that changes in heart function could be an early warning sign for the development of specific cancers.

Researchers tracked the health of thousands of patients over as much as 18 years, comparing MRI scans of the patients’ heart function with their rates of cancer. The study found that patients who had certain subtle changes in heart function were more likely to get cancer in certain areas later on. For example, patients with reduced functioning of the heart’s left atrium were more likely to later develop colon cancer.

Xinjiang Cai, lead author on the study, said in a statement that these “changes in the heart may occur alongside—or even before—biological processes linked to cancer development.” Understanding how deep the connection between heart health and cancer goes could allow doctors to detect cancer earlier.

The relationship between cancer and the heart is complex, and it’s one that scientists are still unraveling. By looking closely at one of the organs most protected from cancer, we might be able to transfer some of that protection to other organs.

Statistically, you probably won’t have to worry about getting heart cancer any time soon. But your heart could someday help doctors understand cancer in other parts of your body.`,
    words: [
      { word: 'margin', pos: 'n.', zh: '邊距，差距' },
      { word: 'rare', pos: 'a.', zh: '稀少，罕見' },
      { word: 'characteristic', pos: 'n.', zh: '特性，特質', match: ['characteristics'] },
      { word: 'organ', pos: 'n.', zh: '器官', match: ['organs'] },
      { word: 'affect', pos: 'v.', zh: '影響', match: ['affected'] },
      { word: 'cellular', pos: 'a.', zh: '細胞的' },
      { word: 'regeneration', pos: 'n.', zh: '再生' },
      { word: 'essential', pos: 'a.', zh: '必要的，基本的' },
      { word: 'process', pos: 'n.', zh: '程序' },
      { word: 'replace', pos: 'v.', zh: '替代' },
      { word: 'damaged', pos: 'a.', zh: '受損的' },
      { word: 'error', pos: 'n.', zh: '錯誤', match: ['errors'] },
      { word: 'mutation', pos: 'n.', zh: '突變', match: ['mutations'] },
      { word: 'activate', pos: 'v.', zh: '啟動', match: ['activated'] },
      { word: 'excess', pos: 'n.', zh: '過度' },
      { word: 'tissue', pos: 'n.', zh: '組織' },
      { word: 'drain', pos: 'v.', zh: '排空，流掉' },
      { word: 'resource', pos: 'n.', zh: '資源', match: ['resources'] },
      { word: 'strain', pos: 'n.', zh: '緊張，壓力' },
      { word: 'genetics', pos: 'n.', zh: '遺傳學' },
      { word: 'overall', pos: 'adv.', zh: '從整體來看' },
      { word: 'turnover', pos: 'v.', zh: '更新率' },
      { word: 'probability', pos: 'n.', zh: '概率' },
      { word: 'risk', pos: 'n.', zh: '風險' },
      { word: 'specific', pos: 'a.', zh: '特定的' },
      { word: 'sturdy', pos: 'a.', zh: '強壯的，結實的' },
      { word: 'tradeoff', pos: 'n.', zh: '利益交換' },
      { word: 'durable', pos: 'a.', zh: '耐久' },
      { word: 'functional', pos: 'a.', zh: '有功能' },
      { word: 'mammal', pos: 'n.', zh: '哺乳類', match: ['mammals'] },
      { word: 'amphibian', pos: 'n.', zh: '兩棲類', match: ['amphibians'] },
      { word: 'scar', pos: 'n.', zh: '疤' },
      { word: 'tend to', pos: 'ph.', zh: '傾向於' },
      { word: 'notable', pos: 'a.', zh: '明顯，注意得到' },
      { word: 'pathway', pos: 'n.', zh: '路線', match: ['pathways'] },
      { word: 'observe', pos: 'v.', zh: '觀察', match: ['observed'] },
      { word: 'heart failure', pos: 'ph.', zh: '心臟衰竭' },
      { word: 'implant', pos: 'n.', zh: '植入' },
      { word: 'relieve', pos: 'v.', zh: '減輕，緩和', match: ['relieves'] },
      { word: 'pump', pos: 'v.', zh: '抽送' },
      { word: 'transplant', pos: 'v.', zh: '移植', match: ['transplanted'] },
      { word: 'introduce', pos: 'v.', zh: '導入', match: ['introduced'] },
      { word: 'protein', pos: 'n.', zh: '蛋白質' },
      { word: 'physical', pos: 'a.', zh: '物理的' },
      { word: 'device', pos: 'n.', zh: '裝置', match: ['Devices'] },
      { word: 'pulse', pos: 'n.', zh: '脈衝' },
      { word: 'imitate', pos: 'v.', zh: '模仿' },
      { word: 'halt', pos: 'v.', zh: '停止' },
      { word: 'targeted', pos: 'a.', zh: '鎖定的' },
      { word: 'prototype', pos: 'n.', zh: '原型機', match: ['Prototypes'] },
      { word: 'extensively', pos: 'adv.', zh: '廣泛地' },
      { word: 'analysis', pos: 'n.', zh: '分析（複數analyses）' },
      { word: 'subtle', pos: 'a.', zh: '隱微的' },
      { word: 'atrium', pos: 'n.', zh: '心房' },
      { word: 'colon', pos: 'n.', zh: '直腸' },
      { word: 'lead author', pos: 'ph.', zh: '第一作者' },
      { word: 'unravel', pos: 'v.', zh: '解開', match: ['unraveling'] },
      { word: 'protect', pos: 'v.', zh: '保護', match: ['protected'] },
      { word: 'transfer', pos: 'v.', zh: '轉移' },
      { word: 'statistically', pos: 'adv.', zh: '從統計角度來看', match: ['Statistically'] },
    ],
  },
  {
    id: 4,
    title: 'In groundbreaking first, humanoid robots performed surgery',
    author: 'Andrew Paul',
    topic: 'Popular Science',
    content: `In a world first, doctors successfully completed not one, but two surgeries with the use of remotely controlled humanoid robots. The proof-of-concept preclinical trial involved gallbladder removals in large, non-primate mammals. A humanoid robot and a human attendant completed one procedure while a pair of robots conducted the second one..

Lifesaving, robotically assisted surgical procedures are commonplace in many medical facilities, but they have limitations. Many of these multiarmed devices are massive systems weighing over 1,800 pounds, and require specialized teams to install them into retrofitted operating rooms. They’re also typically only designed with one type of procedure in mind. In comparison, humanoid robots are what their name implies. At about five feet tall and weighing only 60 pounds, the surgery bots (nicknamed “Surgie”) are comparatively small, nimble, customizable, and much more affordable. With the proper training and technological advancements, fleets of Surgies could one day deploy to critically under-resourced communities.

“Remotely operated and autonomous humanoid robots have real potential for amplifying access to critical surgeries to which patients would otherwise not have access,” Michael Yip, an engineer at the University of California San Diego (UC San Diego), said in a statement. “This can help address the healthcare crisis not only in the United States, but also worldwide.”

Yip and his colleagues recently detailed their groundbreaking trial in a study published in the journal Nature. Although the team needed to design adapters to allow each robot to hold surgical tools, operators said controlling them from afar felt unexpectedly natural.

“We were surprised at how well Surgie meshed with our workspace and workflow,” said UC San

Diego surgeon Nikita Thareja.

“It’s a fraction of the cost and it takes a fraction of the space in an operating room. So it’s easy to deploy, anywhere from rural areas, to the battlefield, and even to space,” added UC San Diego surgeon and study co-author Shanglei Liu.

The first teleoperated humanoid surgeries did encounter a few early issues. The Surgie bots required recalibration multiple times, which greatly slowed the overall process compared to performing them with existing surgical systems. Latency between the controller and the robot also needs improvement. However, researchers are confident the technology will improve, and cite similar progress with robotic laparoscopic surgery. The first of those procedures took six hours, while today’s machine-assisted examples only take around 30 minutes.

A Surgie isn’t necessarily relegated to the operating table, either. The team envisions future humanoid robots could also assist by grabbing tools, or clean up following a surgery.

“One of our goals is to develop [an] autonomous surgical assistant,” Yip said. “Many communities struggle with adequate staffing on the surgical team, which means patients are not being treated. Our goal is an operating theater of the future, where humanoid robots and humans work side by side as an integrated team.”`,
    words: [
      { word: 'surgery', pos: 'n.', zh: '手術', match: ['surgeries'] },
      { word: 'remotely', pos: 'adv.', zh: '遠距地' },
      { word: 'humanoid', pos: 'a.', zh: '人形的，類人的' },
      { word: 'proof-of-concept', pos: 'a.', zh: '為了驗證觀念的' },
      { word: 'preclinical', pos: 'a.', zh: '臨床前的' },
      { word: 'gallbladder', pos: 'n.', zh: '膽囊' },
      { word: 'removal', pos: 'n.', zh: '摘除', match: ['removals'] },
      { word: 'non-primate', pos: 'a.', zh: '非靈長類的' },
      { word: 'attendant', pos: 'n.', zh: '隨從' },
      { word: 'procedure', pos: 'n.', zh: '程序' },
      { word: 'assist', pos: 'v.', zh: '協助', match: ['assisted'] },
      { word: 'commonplace', pos: 'a.', zh: '常見' },
      { word: 'facility', pos: 'n.', zh: '設施，場所', match: ['facilities'] },
      { word: 'multiarmed', pos: 'a.', zh: '有多條手 臂的' },
      { word: 'massive', pos: 'a.', zh: '龐大的' },
      { word: 'install', pos: 'v.', zh: '裝設' },
      { word: 'retrofitted', pos: 'a.', zh: '改裝的' },
      { word: 'operating room', pos: 'ph.', zh: '手術室' },
      { word: 'imply', pos: 'v.', zh: '暗示', match: ['implies'] },
      { word: 'comparatively', pos: 'adv.', zh: '比較起來，相對地' },
      { word: 'nimble', pos: 'a.', zh: '敏捷' },
      { word: 'customizable', pos: 'a.', zh: '可以客製化' },
      { word: 'affordable', pos: 'a.', zh: '平價' },
      { word: 'proper', pos: 'a.', zh: '恰當的' },
      { word: 'fleet', pos: 'n.', zh: '船隊', match: ['fleets'] },
      { word: 'deploy', pos: 'v.', zh: '部署' },
      { word: 'critically', pos: 'adv.', zh: '嚴重地' },
      { word: 'autonomous', pos: 'a.', zh: '自主的' },
      { word: 'potential', pos: 'n.', zh: '潛力' },
      { word: 'amplify', pos: 'v.', zh: '放大，擴大', match: ['amplifying'] },
      { word: 'access', pos: 'n.', zh: '接觸，管 道' },
      { word: 'critical', pos: 'a.', zh: '關鑑的，重要的', match: ['critical', 'critically'] },
      { word: 'address', pos: 'v.', zh: '處理' },
      { word: 'crisis', pos: 'n.', zh: '危機' },
      { word: 'colleague', pos: 'n.', zh: '同事', match: ['colleagues'] },
      { word: 'detail', pos: 'v.', zh: '詳述', match: ['detailed'] },
      { word: 'groundbreaking', pos: 'a.', zh: '有開創性的' },
      { word: 'adapter', pos: 'n.', zh: '調整器', match: ['adapters'] },
      { word: 'operator', pos: 'n.', zh: '操作者', match: ['operators'] },
      { word: 'mash with', pos: 'ph.', zh: '與…交織，融合' },
      { word: 'fraction', pos: 'n.', zh: '零頭' },
      { word: 'rural', pos: 'a.', zh: '農村的' },
      { word: 'teleoperated', pos: 'a.', zh: '遠距操控的' },
      { word: 'encounter', pos: 'v.', zh: '遭遇' },
      { word: 'issue', pos: 'n.', zh: '議題，問題', match: ['issues'] },
      { word: 'recalibration', pos: 'n.', zh: '再校正' },
      { word: 'overall', pos: 'a.', zh: '整體的' },
      { word: 'existing', pos: 'a.', zh: '現有的' },
      { word: 'latency', pos: 'n.', zh: '延遲', match: ['Latency'] },
      { word: 'improvement', pos: 'v.', zh: '改進' },
      { word: 'confident', pos: 'a.', zh: '有信心' },
      { word: 'cite', pos: 'v.', zh: '舉出' },
      { word: 'progress', pos: 'n.', zh: '進步' },
      { word: 'laparoscopic', pos: 'a.', zh: '腹腔鏡的' },
      { word: 'relegate … to', pos: 'ph.', zh: '將…指派到（較低）職位' },
      { word: 'operating table', pos: 'ph.', zh: '手術檯' },
      { word: 'envision', pos: 'v.', zh: '想像', match: ['envisions'] },
      { word: 'grab', pos: 'v.', zh: '抓起' },
      { word: 'assistant', pos: 'n.', zh: '助手' },
      { word: 'struggle', pos: 'v.', zh: '掙扎' },
      { word: 'adequate', pos: 'a.', zh: '充足的' },
      { word: 'staffing', pos: 'n.', zh: '人員' },
      { word: 'operating theater', pos: 'ph.', zh: '手術室' },
      { word: 'integrated', pos: 'a.', zh: '整合的' },
    ],
  },
]
