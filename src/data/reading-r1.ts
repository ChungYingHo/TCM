export interface ReadingWord {
  word: string
  pos: string
  en: string
  zh: string
}

export interface ReadingArticle {
  id: number
  title: string
  topic: string
  content: string
  words: ReadingWord[]
}

export const READING_R1_META = {
  code: 'R1',
  title: '增補資料 R1 字彙',
  source: 'VOA Intermediate',
  author: '旋元佑',
  articleCount: 7,
  wordCount: 47,
}

export const READING_R1: ReadingArticle[] = [
  {
    id: 1,
    title: 'Experts Provide Tips for Avoiding Computer-linked Vision Trouble',
    topic: '健康科技',
    content: `Computer, or digital, screens are common at work, homes, schools, and stores. An estimated 104 million Americans of working age spend more than seven hours a day in front of screens, the American Optometric Association says. All that screen time can cause harm.

Too much screen viewing can lead to dry or watery eyes, unclear vision and headaches. It can also lead to vision conditions including myopia, or nearsightedness, especially in children. Some technology workers even describe short times of dizziness or vertigo when they look at screens for too long.

However, exposure to blue light from digital screens has not been shown to cause permanent eye damage, the American Academy of Ophthalmology says.

## Overworked eyes

One reason for the screen-linked vision problems lies in the eye muscles. Staring closely at screens for long amounts of time can cause the muscle used for eye focus to become too tense, or tight.

"That muscle's not supposed to stay tight all day long. And if it does, it's like picking up a light weight and trying to hold it over your head for hours," American Optometric Association President Steven Reed told the Associated Press (AP). It is not hard to lift, he said, "But after a while, even though it's not a heavy lift, your body just gets tired," he added.

The vision problems can affect work, family time and rest. As an optometrist in Mississippi, Reed sees people who are experiencing eye pain, headaches and unclear vision linked with computer use. He suggests that people with such problems get an eye examination and take regular breaks from screen viewing.

Here are some more tips from eye health professionals to reduce eye strain caused by devices.

## Follow the 20-20-20 rule

Take a break every 20 minutes from looking at a computer. During the break, focus your eyes on something that is about 20 feet away (6 meters) for 20 seconds. This will help ease tired, tight eye muscles.

"Luckily, eye strain is temporary," said Raj Maturi, an eye doctor, or ophthalmologist, at Midwest Eye Institute in Indianapolis and spokesperson for the American Academy of Ophthalmology. "The best way to avoid these symptoms is by taking breaks from our screens or near work activities and using lubricating eye drops, if needed," he said.

People normally close their eyes very briefly about 18 to 22 times per minute. This helps lubricate the eye naturally. But when looking at a screen, people might close their eyes only three to seven times per minute, the Cleveland Clinic says. That is when use of eye drops might be considered.

## Change your desk setup

Some people find that using a larger computer screen helps reduce eye tiredness, or fatigue. You can also increase the image size on your laptop, monitor or smartphone screen.

Sitting an arm's length away from your screen and looking down at it also can help reduce eye strain, the American Academy of Ophthalmology says.

## Product claims

Some products for computer users, such as blue light glasses, are marketed with claims that they will reduce eye strain, improve sleep and prevent eye disease. But several studies have found the glasses are not very effective, says the American Academy of Ophthalmology. The group says it is how people use digital devices that causes problems, not the blue light coming from screens.

## Extracurricular optics

Even after stepping away from work on larger computers, many adults find themselves using smaller digital devices for reading or watching shows. And many children use small digital devices such as laptops, tablets, and smartphones in school.

Ayesha Malik of the Children's Hospital of Philadelphia said that too much screen time or focusing on nearby objects can speed development of nearsightedness, especially in children. She added that anyone watching shows should do so on a television, instead of a tablet, to help avoid eye strain.

Children should follow the 20-20-20-2 rule, she said. The added "2" stands for 2 hours of play outside every day, which helps with eye development, Malik said.

"The reality is that most children are engaging with screens throughout the day at school and home. It becomes difficult to track the total number of hours," she said. "Aim for not more than 20 minutes during any one session."

## Sleeping soundly

The blue light that digital screens release can increase a person's alertness, experts say. As a result, their use might make it difficult to fall asleep or sleep well.

To give your eyes and brain the rest they need, doctors suggest turning off screens one to two hours before going to sleep. You can also change the setting on digital devices to lower screen brightness. If you are used to watching videos at night, try listening to an audiobook or podcast instead.`,
    words: [
      { word: 'focus', pos: 'v.', en: 'to adjust the point of concentration of the eye', zh: '聚焦、對焦' },
      { word: 'optometrist', pos: 'n.', en: 'a health care professional who examines and treats the eye for problems', zh: '驗光師' },
      { word: 'engage', pos: 'v.', en: 'to give attention to something, to participate', zh: '參與、投入' },
      { word: 'lubricate', pos: 'v.', en: 'to apply something that lessens or prevents difficulty or friction', zh: '潤滑' },
      { word: 'fatigue', pos: 'n.', en: 'tiredness or exhaustion from exertion or stress', zh: '疲勞' },
      { word: 'progression', pos: 'n.', en: 'the action or process of developing (or progressing)', zh: '進展、惡化' },
    ],
  },
  {
    id: 2,
    title: "Saying 'No' at Work Can Be Good for Your Health",
    topic: '職場健康',
    content: `People might find it hard to set work limits or say "no" before taking on too many responsibilities. But experts say it is important for workers to learn to set such limits, or boundaries.

These limits can be important in helping workers protect their physical and mental health. And as with any new skill, setting boundaries gets easier with practice.

Justin Stewart is a 36-year-old who works as a news show production assistant. He told The Associated Press that in the past, he had problems setting clear limits in his work life.

Stewart explained that when starting his career, he held several jobs. In addition to his full-time position, he also rented cars at the airport and did sales at a store. He said his life was so busy that he would sometimes sleep in his car between jobs. After a time, he had to be hospitalized for extreme tiredness and an infection.

Stewart said that over time, his busy work life finally caught up with him. "While people around me praised my hustle, I eventually paid the price." He added, "The doctor looked at me and said, 'I don't know what lifestyle you're living, but you're too young to be this stressed. You're going to have to quit something.'"

As a result, Stewart began trying to set boundaries. He gave up his side jobs after deciding he could live without the extra money. If people from the news show contacted him to work after-hours, he told them he was not available and suggested other people who might be able to help.

However, experts say making such changes can be difficult. Many people already have a hard time turning down work requests – from both co-workers and managers. For example, it might make some people feel good to be needed or to please others. But as with any new skill, setting boundaries can get easier over time.

Here are some suggestions from employment experts and workers for effectively setting meaningful work limits.

## Take control of your time

If your goal is to do less, adding things to your daily plans may seem like a bad idea. But it can actually provide more control over your time.

Bobby Dutton is the founder of event production company GBM6.

Every Monday at 2 p.m., he plans the task he is most likely to delay finishing. And to keep from becoming too busy, he even sets his daily activities, like walking his dog and eating lunch.

## Practice "no" responses

If workers have a hard time saying no, they can write down what to say beforehand. And it can also help to say it out loud.

Cara Houser is a workplace engagement coach. She says workers do not always have to explain themselves when turning down a request. They can simply explain they are not available, thank the person for asking, and suggest when they might be available.

Amber Krasinski grew up in a working-class environment where saying "no" to a manager could mean losing pay. As the founder of marketing company IvyHill Strategies, Krasinski worries that she will lose business if she turns down a project.

So, she often says "not yet" when one more project is too much. "That phrase has helped me through a lot of situations," she said.

## Know yourself

When asked for help, workers may want to agree immediately. However, when faced with a new work request, it can be better to take time before answering. Use the time to consider such things as workload, energy level, and interest.

Israa Nasir is a psychotherapist in New York. She suggests that workers often pay attention to the activities and interactions that leave them feeling tired or stressed. Those kinds of events can be put on a "No List" to be dealt with later.

## Technology can help

Experts say that just because mobile devices can keep people connected to work all the time, they do not have to interfere with a person's non-working life.

For example, Nasir said she found herself checking email far too often on weekends. So, during weekends, she moved the Gmail app from her iPhone's homepage to the second page. This extra step helped her avoid checking her email.

Experts also suggest using an email signature as another tool to manage expectations. This tool can include more than just your name and contact information. You can also use it to let others know your working hours or upcoming vacation plans.`,
    words: [
      { word: 'hustle', pos: 'n.', en: 'to move or work rapidly and tirelessly', zh: '拼命工作、奔忙' },
      { word: 'pay the price', pos: 'idiom', en: 'to experience the bad result of something you have done', zh: '付出代價' },
      { word: 'stressed', pos: 'adj.', en: 'affected by a factor that causes bodily or mental tension', zh: '有壓力的、緊張的' },
      { word: 'manager', pos: 'n.', en: 'a person who manages especially a business or household affairs', zh: '經理、主管' },
      { word: 'engagement', pos: 'n.', en: 'the state of being meshed into a working arrangement', zh: '投入、參與' },
      { word: 'psychotherapist', pos: 'n.', en: 'person who treats mental or emotional disorders by psychological means', zh: '心理治療師' },
      { word: 'email signature', pos: 'n.', en: 'a block of text or image that appears at the end of an email message', zh: '電子郵件簽名檔' },
    ],
  },
  {
    id: 3,
    title: 'Scientists Link Gene to Human Speech',
    topic: '遺傳科學',
    content: `A new study suggests the beginnings of human speech are linked to genetics. The research identifies a protein – found only in people – that may have helped early humans develop spoken communication.

Scientists involved in the study say this new speaking ability became important for humans' survival. For example, speech permitted individuals to share information, organize activities and pass down knowledge. These abilities are now seen as an advantage humans had over their relatives, such as the Neanderthals and Denisovans.

The researchers recently published their findings in a study in the journal Nature Communications.

Liza Finestack teaches about speech and hearing at the University of Minnesota. She told The Associated Press (AP) the new study is "a good first step to start looking at the specific genes" that may affect speech and language development. Finestack was not involved in the study.

Dr. Robert Darnell has long been studying the protein – called NOVA1 – at his laboratory at New York's Rockefeller University. He helped lead the new research and was a writer of the study. Darnell told the AP the genetic version, or variant, included the protein that helped humans develop into the "dominant species" that remains today.

The latest research involved scientists using CRISPR gene editing methods to replace the NOVA1 protein found in mice with the one found in humans. The aim was to test the real-life effects of the genetic variant. The researchers were surprised to learn that the variant changed the way the animals called out to each other.

Baby mice with the human variant made a different sound than normal mice do when their mother came around. Adult male mice with the variant also made different sounds when they were near a female they wanted to mate with.

Darnell said both of these situations gave the mice a reason to speak. Those with the human variant "spoke differently," demonstrating the gene's influence in speech, he added.

This is not the first time a gene has been linked to speech. In 2001, British scientists said they had discovered the first gene tied to a language and speech disorder.

Researchers called this human language gene FOXP2. But even though FOXP2 was found to be linked to human language, the variant in modern humans was not found in our species alone. Later research found it was shared with Neanderthals. The NOVA1 variant in modern humans, on the other hand, is found only in our species, Darnell said.

The presence of a gene variant is not the only thing that permits people to speak. The ability also depends on physical elements in the human throat and areas of the brain that work together to help people produce speech and understand language.

Darnell said he hopes the recent work can lead to new ways to treat speech-related problems.

The University of Minnesota's Finestack noted the genetic findings could also one day permit scientists to identify people who might need help developing speech and language early in life.

"That's certainly a possibility," she said.`,
    words: [
      { word: 'advantage', pos: 'n.', en: 'something that helps to make someone or something better or more likely to succeed', zh: '優勢、有利條件' },
      { word: 'specific', pos: 'adj.', en: 'special or particular', zh: '特定的、具體的' },
      { word: 'variant', pos: 'n.', en: 'something that is different in some way from others of the same kind', zh: '變異體、變體' },
      { word: 'dominant', pos: 'adj.', en: 'more important, powerful, or successful than most or all others', zh: '主宰的、優勢的' },
      { word: 'species', pos: 'n.', en: 'a group of animals or plants that are similar and can reproduce', zh: '物種' },
      { word: 'CRISPR', pos: 'n.', en: 'a genome-editing tool that allows scientists to precisely cut and modify DNA sequences', zh: '基因編輯工具' },
      { word: 'throat', pos: 'n.', en: 'the tube inside the neck that leads to the stomach and lungs', zh: '喉嚨、咽喉' },
    ],
  },
  {
    id: 4,
    title: "Japan's Toyota Builds a City-like Center to Test Robotics, AI",
    topic: '科技創新',
    content: `Japanese automaker Toyota says it is building a research center in a city-like setting to test robotics, artificial intelligence (AI) and autonomous vehicle technologies.

Toyota recently announced it had completed the first part, or phase, of the center, called Woven City. It sits near the southern Japanese city of Susono. Company officials recently showed off the latest progress to reporters from the Associated Press.

Daisuke Toyoda is an executive for Toyota who is helping lead the project. He told the AP that the center was not designed to be a "smart city." However, it aims to carry out technology research and development and be "a test course for mobility."

The company said Woven City would serve as a "Living Laboratory." It aims to test technology systems to support future changes in "the movement of people, goods, information and energy."

Toyoda said the center is meant to be a place where researchers and technology company officials can come together and share ideas. It will also seek to establish a community with a shared desire "to co-create, develop and refine" new technology products and services.

Woven City was built on the grounds of a closed Toyota automobile factory. The automaker said the project's first phase covers about 47,000 square meters. When completed, it will spread out over 294,000 square meters.

Building operations on Woven City began in 2021. All the buildings are connected by underground passageways. Among planned testing activities will include self-driving vehicles making waste pickups and completing deliveries around the area. Testing operations will center on how people living in cities can best interact with changing technologies.

Currently, no one lives in Woven City. When it opens, officials plan on having about 100 people living there. They will be called "weavers." These are workers employed by Toyota and its partner companies making other products.

When AP reporters visited the area, Japanese coffee maker UCC was serving hot drinks from a self-driving bus. The bus was parked in an area surrounded by still-empty housing.

Toyota has supported electric vehicle (EV) technology in the past. However, the company is currently involved in a push for hydrogen, the energy of choice in Woven City.

Keisuke Konishi is an automobile expert at Japan's Quick Corporate Valuation Research Center. He told the AP Toyota has plans to expand into self-driving vehicle services to compete with Google's Waymo and other large companies.

Konishi noted the company has the money for such development even if it means building up a completely new business. "Toyota has the money to do all that," he said.

Toyota officials have said they do not expect Woven City to make money, at least not for the first few years.

Several other futuristic developments have been planned in other areas of the world over the years. They have included efforts in Toronto, Canada; Saudi Arabia; Abu Dhabi; and San Francisco, California. But those projects are either still being developed or have been canceled.`,
    words: [
      { word: 'autonomous', pos: 'adj.', en: 'able to operate without the help of people', zh: '自主的、自動駕駛的' },
      { word: 'mobility', pos: 'n.', en: 'the ability to move or walk around freely', zh: '移動性、機動性' },
      { word: 'refine', pos: 'v.', en: 'to make something pure or improve something, especially by removing unwanted material', zh: '精煉、改良' },
      { word: 'deliver', pos: 'v.', en: 'to move goods from one place to another', zh: '遞送、交付' },
      { word: 'park', pos: 'v.', en: 'put a vehicle in a place where it can stay for a period', zh: '停車、停放' },
    ],
  },
  {
    id: 5,
    title: 'Taiwan to Kill Tens of Thousands of Iguanas to Protect Farmland',
    topic: '生態環境',
    content: `Taiwan plans to kill up to 120,000 green iguanas that are damaging the island's agriculture industry.

Around 200,000 of the animals are believed to be in the island's southern and central areas. Both areas are heavily dependent on farming, said Chiu Kuo-hao of the Forestry and Nature Conservation Agency.

Special hunting teams killed about 70,000 iguanas last year, earning up to $15 for each kill. Local governments have asked the public to help identify iguana nests, or homes. Officials also advised people to use fishing spears to kill the iguanas in the most humane way.

Lee Chi-ya is with the agricultural department in the southern county of Pingtung. Lee said many people in Taiwan bought iguanas as pets, not understanding how big they get or how long they live.

"So, they set them free in the wild, where they've really taken to the Taiwanese environment," Lee said. This permitted the animals to, in Lee's words, "reproduce at a considerable rate, necessitating us to cull them and restore the balance of nature."

Green iguanas have no natural predators in Taiwan. The animals have moved into areas that can be difficult to enter, mostly forests and the edges of towns.

Males can grow to two meters long and weigh as much as five kilograms. Females are a little smaller and can lay up to 80 eggs at a time. The green iguana can live up to 20 years.

The animals are native mainly to Central America and the Caribbean. They have sharp spines on their body and sharp teeth as well. Their tails are powerful and can strike in attack or defensive actions. Experts say iguanas are not aggressive animals. Their diet is mainly plants, including fruits and leaves.

Hsu Wei-chieh is secretary general of the Reptile Conservation Association of Taiwan. He said the group wants to teach farmers how to stay safe, protect their property and treat the iguanas humanely.

"We're here to help see that this project is carried out smoothly," said Hsu.

Tsai Po-wen, a vegetable farmer in Pingtung, said the training was valuable.

"We used to attack them, but it wasn't any use. Now we're learning more effective, safer methods," Tsai said.`,
    words: [
      { word: 'spear', pos: 'n.', en: 'a long sharp cutting instrument used for hunting or as a weapon', zh: '矛、魚叉' },
      { word: 'cull', pos: 'v.', en: 'to kill animals as part of an effort to reduce their numbers', zh: '撲殺（以控制數量）' },
      { word: 'spine', pos: 'n.', en: 'sharp, needle-like structures on the skin or body covering of some animals and plants', zh: '棘刺' },
      { word: 'predator', pos: 'n.', en: 'an animal that feeds on other animals to live', zh: '掠食者' },
    ],
  },
  {
    id: 6,
    title: 'Using Real Trees to Bring Nature Indoors',
    topic: '建築設計',
    content: `There is a growing movement worldwide to use plants in building design to establish closer connections with nature and soften hard city styles. The movement also seeks to improve designs to help protect the environment and increase personal wellness.

Many of the efforts by architects and designers have centered on one natural element: trees.

Examples of such design can be found in many places, including New York City. A building in Manhattan that houses the Ford Foundation has a 12-story light-filled entrance area, or atrium. It is also filled with plants and flowers including magnolias, eucalyptus, jacaranda, cryptomeria, iron bark and pear trees.

Another example sits within New York City's Brookfield Place shopping center. The center's main atrium includes a collection of 12-meter-tall Washingtonia palm trees.

In Singapore, the city-state's Jewel Changi airport offers travelers an inviting environment. It has 2,500 trees native to nations including Madagascar, Australia, Malaysia and Indonesia. The airport includes a 2.4-hectare indoor forest with walking paths.

Some apartments and mixed-use buildings are also putting trees and other greenery into their designs. Such buildings are sometimes called "greenscrapers," a term that comes from the word "skyscraper."

In Milan, Italy, architect Stefano Boeri designed Bosco Verticale, a 44-story building with 800 trees and other greenery. In the Netherlands, he also built the Trudo Vertical Forest. This is a low-income apartment building with trees growing on all sides.

Similar changes are also happening inside private homes. In some, trees are brought right indoors. In others, outdoor trees are carefully placed as important partners in the building plan.

Some architects even build homes around existing trees. Others plant one or more trees inside the home. And some architects or designers imagine natural settings indoors by using parts of trees. These designs are meant to create the look and feel of real wood, while bringing feelings of peace and calm.

## A calm heart of the home

Ryoko Okada is an architect at New York City's Oda Architecture. She told The Associated Press that she and her co-workers aim to bring outdoor elements indoors as often as they can.

"There's nothing more calming than being surrounded by nature…" Okada said. She added that a living tree indoors can bring peace and happiness as people watch it grow and change.

## Framing the views with existing trees

Another design example came from KAA Design Group in Los Angeles. A team from the company created a modern home that uses the property's existing trees, such as cork oaks, rare Torrey pines, and magnolias.

One very large, old cork oak sits in the center of the property. At first, the owners did not like the look and said they wanted the tree gone. One of the company's partners, Grant Kirkpatrick, had to persuade the homeowners to keep it. Kirkpatrick explained he succeeded by pointing out that the tree was "a 300-year-old antique that should be featured rather than removed."

The driveway on that property also offers a calming design. A black pine tree rises up from the driveway like a piece of natural art. In addition, views from almost every window in the house feature the beautiful nature outdoors.

## Things to consider

Okada says she suggests people do not plant a full-size tree in their home without first seeking expert advice. She notes that a living tree will only do well if certain conditions – such as air, light and soil – are right.

Okada added that a living tree "… needs to be supported by proper infrastructure to stay alive and avoid home damage." She also urges people to heavily research a tree's natural environment to avoid drawing in unwanted pests.

Kirkpatrick noted that planting a tree indoors can be difficult. He explained that at least 1.2 meters of soil depth is needed, along with lots of natural light and the right temperature.

## Other ways to use trees besides having a live one

Kirkpatrick said he worked on one property that experienced a serious fire in 2016. His team decided to use parts from one of the burned manzanita trees in the interior design. The piece was painted black and placed inside the property. He said it now represents an eye-catching, natural art piece.`,
    words: [
      { word: 'skyscraper', pos: 'n.', en: 'a very tall building', zh: '摩天大樓' },
      { word: 'style', pos: 'n.', en: 'a particular manner or technique by which something is done, created, or performed', zh: '風格、樣式' },
      { word: 'architect', pos: 'n.', en: 'a person who designs buildings and advises in their construction', zh: '建築師' },
      { word: 'apartment', pos: 'n.', en: 'a room or set of rooms used as a dwelling', zh: '公寓' },
      { word: 'antique', pos: 'n.', en: 'something in the style or fashion of former times', zh: '古董、古物' },
      { word: 'feature', pos: 'n.', en: 'a part or detail that stands out', zh: '特色、亮點' },
      { word: 'infrastructure', pos: 'n.', en: 'the underlying foundation or basic framework', zh: '基礎設施' },
      { word: 'pest', pos: 'n.', en: 'a plant or animal harmful to human beings or human concerns', zh: '害蟲、有害生物' },
    ],
  },
  {
    id: 7,
    title: 'Traditional Seoul Village Hopes Curfew Brings Back Normal Life',
    topic: '文化觀光',
    content: `In South Korea's capital of Seoul, Bukchon Hanok Village's narrow winding alleyways date back hundreds of years to the Joseon Dynasty. The area has become a popular place to visit, especially after appearing in a television show about 10 years ago.

Foreign visitors and Koreans visit the neighborhood to see houses with wood columns, courtyards and tiled roofs.

The area attracted about 6 million visitors last year while the population of the area is around 6,100.

However, increasing numbers of visitors have become a problem for people who live there. They complain about noise, trash, bad behavior and invasion of privacy.

Some visitors have been caught on camera trying to enter private homes or looking inside without permission, creating conflict with locals.

Many local people have chosen to leave, leading to a 27.6 percent drop in the village's population over the past 10 years.

Village officials now want to set a curfew in the area. The curfew will limit visitors to certain areas of Bukchon from 5 p.m. to 10 a.m. local time. It will start as a trial in November and will be officially launched next March. Violators could pay fines of up to $72.

Chung Moon-hun is the head of Jongno district. Chung said the goal is to protect the rights of local people. Chung said the curfew can be changed if necessary to make it more effective. The area where curfew hours and fines will be in effect is about 34,000 square meters. That is about the size of five soccer fields.

Kwon Young-doo owns the private Asian Cultural Art Museum in Bukchon Hanok Village. Kwon is concerned about the curfew policy aimed at preventing visitors from overrunning the area.

"Who would want to visit?" asked Kwon who moved into the historic area 18 years ago. "They'll leave with a bad impression of South Korea."

Others do not believe the policy will be effective. They note measures such as exemptions for visitors staying overnight in traditional houses called hanok. Many of these hanok are now owned by businesses after officials loosened restrictions on overnight stays.

"People come for just a day to enjoy themselves, and the noise from parties is extremely loud," said Kim Eun-mee, who lives next to a hanok. Clearing trash in front of her home has become a task she has to perform several times a day.

"It's often difficult to maintain a normal daily routine due to disturbances." She said people often make noise moving their suitcases around even in the early hours, which wakes her up.

Lee Dong-woo is head of the website BUTLER.LEE which is used to rent the hanoks. Lee said the business grew when owners who found it difficult to modernize or maintain old houses turned them over to businesses.

"These requests are driving the expansion, not because we are actively evicting current residents to operate hanok stays," Lee said. Lee oversees 17 hanok stays in Bukchon.

Visitors are divided over the curfew. Some agree locals' quality of life is important. Others are unhappy at the idea of getting fined for simply walking down a public street.

There are also questions about how the rules will be enforced; how to tell visitors from locals; how to make foreigners pay a fine, and how to deal with the language barrier.`,
    words: [
      { word: 'dynasty', pos: 'n.', en: 'a group of associated rulers who govern a country for a long time', zh: '朝代、王朝' },
      { word: 'column', pos: 'n.', en: 'a circular or square support for a building', zh: '柱子' },
      { word: 'courtyard', pos: 'n.', en: 'an open area surrounded by buildings', zh: '庭院、中庭' },
      { word: 'roof', pos: 'n.', en: 'the top of a house that protects the inside from rain and sun', zh: '屋頂' },
      { word: 'trash', pos: 'n.', en: 'waste and unwanted materials', zh: '垃圾' },
      { word: 'trial', pos: 'n.', en: 'a test', zh: '試行、試驗' },
      { word: 'exemption', pos: 'n.', en: 'freedom from having to observe a rule that everyone else must follow', zh: '豁免、免除' },
      { word: 'routine', pos: 'n.', en: 'something that is done regularly as a normal part of a day or week', zh: '日常生活、慣例' },
      { word: 'disturbance', pos: 'n.', en: 'a happening that is loud, surprising or that causes people to change what they would normally do', zh: '干擾、騷動' },
      { word: 'evict', pos: 'v.', en: 'to remove someone from where they normally stay or live', zh: '驅逐、逐出' },
    ],
  },
]
