// text_samples.js - 50 different texts of ~100 words each

const TEXT_SAMPLES = [
    // Science & Nature (1-10)
    {
        id: 1,
        category: "science",
        text: "The human brain is the most complex organ in the body. It contains about 86 billion neurons and even more glial cells. Each neuron can connect with thousands of others, forming trillions of connections. This incredible network allows us to think, remember, learn, and experience emotions. Scientists are still discovering how the brain works and how we can keep it healthy throughout our lives. The brain consumes about twenty percent of the body's energy even though it makes up only two percent of our body weight. It is protected by the skull and by the blood-brain barrier which prevents harmful substances from entering. Different regions of the brain control different functions like movement, speech, and memory."
    },
    {
        id: 2,
        category: "science",
        text: "Photosynthesis is the process by which plants convert light energy into chemical energy. They use sunlight, water, and carbon dioxide to produce glucose and oxygen. This process is fundamental to life on Earth, as it provides the oxygen we breathe and forms the base of most food chains. Chlorophyll, the green pigment in leaves, captures light energy. Plants also need minerals from the soil to grow properly. Without photosynthesis, life as we know it would not exist. The process happens in chloroplasts within plant cells. Different plants have adapted to perform photosynthesis in various environments, from deserts to rainforests. Some bacteria also perform photosynthesis using different pigments."
    },
    {
        id: 3,
        category: "science",
        text: "The solar system consists of eight planets orbiting the Sun. The four inner planets are rocky and small, while the four outer planets are gas giants. Jupiter is the largest planet, and Mercury is the smallest. Earth is unique in having liquid water and life. The Moon is Earth's only natural satellite and affects our tides. Mars has the largest volcano in the solar system, Olympus Mons, which is three times taller than Mount Everest. Saturn's rings are made of ice and rock particles. Uranus and Neptune are ice giants with different compositions. The solar system also contains dwarf planets like Pluto, asteroids in the asteroid belt, and comets from the distant Oort cloud."
    },
    {
        id: 4,
        category: "science",
        text: "The ocean covers about seventy-one percent of Earth's surface and contains ninety-seven percent of the planet's water. The deepest part is the Mariana Trench, which extends nearly eleven kilometers below sea level. Scientists estimate that about eighty percent of the ocean is unexplored. Marine life ranges from microscopic plankton to the largest animal on Earth, the blue whale. Coral reefs are among the most diverse ecosystems, often called the rainforests of the sea. Ocean currents circulate water around the globe, regulating climate and distributing nutrients. The ocean also produces more than half of the world's oxygen through phytoplankton photosynthesis."
    },
    {
        id: 5,
        category: "science",
        text: "The human body has over six hundred muscles, each with a specific function. The largest muscle is the gluteus maximus, while the smallest is the stapedius in the middle ear. Muscles work in pairs to create movement. When one muscle contracts, its partner relaxes. There are three types of muscles: skeletal muscles that we control voluntarily, smooth muscles that work automatically in organs, and cardiac muscle that pumps blood through the heart. Regular exercise keeps muscles strong and healthy. Muscles need protein to repair and grow after activity. Even when we sleep, our muscles maintain tone to keep our body in position."
    },
    {
        id: 6,
        category: "science",
        text: "The human heart beats about one hundred thousand times per day, pumping blood through approximately sixty thousand miles of blood vessels. This incredible organ works continuously throughout our lives without rest. The heart has four chambers: two atria and two ventricles. Valves between chambers ensure blood flows in the correct direction. Blood carries oxygen and nutrients to all parts of the body and removes waste products. The circulatory system includes arteries, which carry blood away from the heart, and veins, which return blood to it. Regular exercise strengthens the heart and reduces the risk of cardiovascular disease."
    },
    {
        id: 7,
        category: "science",
        text: "DNA contains the genetic instructions for all living organisms. This remarkable molecule is shaped like a double helix, discovered by scientists Watson and Crick in 1953. DNA is made of four chemical bases: adenine, thymine, cytosine, and guanine. The sequence of these bases determines genetic information. Humans share about ninety-nine percent of their DNA with each other and about sixty percent with bananas. DNA can replicate itself during cell division, ensuring genetic information is passed to new cells. Mutations in DNA can lead to genetic disorders but also drive evolution by creating variation."
    },
    {
        id: 8,
        category: "science",
        text: "The water cycle continuously moves water around our planet. The sun's heat causes water to evaporate from oceans, lakes, and rivers. As water vapor rises, it cools and condenses into clouds. When clouds become heavy, water falls back to Earth as precipitation in the form of rain, snow, or hail. Some water soaks into the ground, becoming groundwater. Plants absorb water through their roots and release it through their leaves in a process called transpiration. Eventually, water returns to the oceans, and the cycle begins again. This natural process has been operating for billions of years."
    },
    {
        id: 9,
        category: "science",
        text: "The Earth's atmosphere is a thin layer of gases that protects life on our planet. It consists mainly of nitrogen about seventy-eight percent and oxygen about twenty-one percent, with small amounts of argon, carbon dioxide, and other gases. The atmosphere has several layers: the troposphere where weather occurs, the stratosphere containing the ozone layer, the mesosphere where meteors burn up, the thermosphere with the auroras, and the exosphere at the edge of space. The atmosphere shields us from harmful solar radiation and traps heat through the greenhouse effect, keeping our planet warm enough for life."
    },
    {
        id: 10,
        category: "science",
        text: "Volcanoes form when magma from beneath Earth's crust rises to the surface. When magma erupts, it becomes lava, which can flow for miles before cooling into rock. Volcanic eruptions can be explosive, sending ash and gas high into the atmosphere, or effusive, producing gentle lava flows. The Ring of Fire around the Pacific Ocean contains most of the world's active volcanoes. Volcanic soil is rich in nutrients, making areas near volcanoes good for farming. However, eruptions can also be destructive, burying cities and affecting global climate. Scientists monitor volcanoes to predict eruptions and protect nearby populations."
    },

    // History (11-20)
    {
        id: 11,
        category: "history",
        text: "The ancient Egyptians built magnificent pyramids as tombs for their pharaohs. The Great Pyramid of Giza stood as the tallest man-made structure for over thirty-eight hundred years. Egyptians developed hieroglyphics, one of the earliest writing systems. They made advances in mathematics, medicine, and astronomy. The Nile River was central to their civilization, providing water, transportation, and fertile soil for farming. Egyptian society was highly structured, with the pharaoh at the top and slaves at the bottom. They believed in an afterlife and mummified bodies to preserve them for the journey to the next world."
    },
    {
        id: 12,
        category: "history",
        text: "The Roman Empire was one of the largest and most powerful in history. At its peak, it controlled territory across Europe, North Africa, and the Middle East. Romans developed advanced engineering, building roads, aqueducts, and amphitheaters. They created a system of law that influences legal systems today. Latin, their language, evolved into the Romance languages and contributed many words to English. The Roman army was highly disciplined and effective, allowing the empire to expand and defend its borders. Internal strife, economic problems, and invasions eventually led to the empire's decline and fall."
    },
    {
        id: 13,
        category: "history",
        text: "The Renaissance was a period of cultural rebirth in Europe from the fourteenth to seventeenth centuries. It began in Italy and spread across the continent. Artists like Leonardo da Vinci, Michelangelo, and Raphael created masterpieces. Writers like Shakespeare produced enduring works of literature. Scientists like Galileo challenged traditional views of the universe. The invention of the printing press spread knowledge more widely than ever before. The Renaissance emphasized humanism, focusing on human potential and achievement. This period bridged the Middle Ages and modern history, influencing art, science, and thought for centuries to come."
    },
    {
        id: 14,
        category: "history",
        text: "The Industrial Revolution began in Britain in the late eighteenth century. New machines like the steam engine transformed manufacturing. Factories replaced cottage industries. Railroads revolutionized transportation. Cities grew rapidly as people moved from farms to work in factories. Working conditions were often harsh, leading to labor movements and reforms. The Industrial Revolution spread to Europe and North America, changing society fundamentally. It created new social classes, with industrialists becoming wealthy while many workers lived in poverty. Technological advances continued, leading to the modern industrial world we know today."
    },
    {
        id: 15,
        category: "history",
        text: "World War One from nineteen fourteen to nineteen eighteen involved many of the world's great powers. New technologies like machine guns, tanks, and poison gas made it devastatingly deadly. Trench warfare led to stalemate on the Western Front. The war redrew maps and toppled empires. The Treaty of Versailles imposed harsh terms on Germany, setting the stage for future conflict. Millions of soldiers and civilians died, making it one of the deadliest conflicts in history. The war also saw the first use of aircraft in combat and the first widespread use of submarines."
    },
    {
        id: 16,
        category: "history",
        text: "World War Two from nineteen thirty-nine to nineteen forty-five was the deadliest conflict in human history. The Holocaust saw the systematic murder of six million Jews. Atomic bombs were used for the first time. The war ended with the surrender of Germany and Japan. The United Nations was established to promote international cooperation. The Cold War began between the United States and Soviet Union. The war involved more than thirty countries and resulted in over seventy million deaths. It changed the global balance of power and led to the decolonization of many countries in Asia and Africa."
    },
    {
        id: 17,
        category: "history",
        text: "The American Revolution began in seventeen seventy-five as colonists sought independence from British rule. The Declaration of Independence, written by Thomas Jefferson, proclaimed fundamental rights. George Washington led the Continental Army to victory. The Constitution established a new form of government with checks and balances. The Bill of Rights guaranteed individual freedoms. The revolution inspired other movements for independence around the world. It established the United States as a new nation based on democratic principles. The war lasted eight years and changed the course of history."
    },
    {
        id: 18,
        category: "history",
        text: "The French Revolution from seventeen eighty-nine to seventeen ninety-nine overthrew the monarchy and transformed society. The storming of the Bastille became a symbol of revolution. The Declaration of the Rights of Man proclaimed equality. Napoleon rose to power and conquered much of Europe. The revolution spread ideas of liberty, equality, and fraternity. It led to the rise of nationalism and inspired future revolutions. The revolution also brought significant social changes, including the abolition of feudal privileges and the establishment of a more meritocratic society."
    },
    {
        id: 19,
        category: "history",
        text: "The Age of Exploration from the fifteenth to seventeenth centuries saw European sailors venture across oceans. Columbus reached the Americas in fourteen ninety-two. Magellan's expedition circumnavigated the globe. These voyages led to cultural exchange but also colonization and conflict. New foods like potatoes and tomatoes were introduced to Europe. Knowledge of world geography expanded dramatically. The Columbian Exchange transferred plants, animals, and diseases between the Old and New Worlds. This period fundamentally changed global demographics and ecosystems."
    },
    {
        id: 20,
        category: "history",
        text: "The Silk Road was an ancient network of trade routes connecting East and West. It stretched from China to the Mediterranean Sea. Merchants traded silk, spices, and other luxury goods. Ideas, religions, and technologies also spread along these routes. Buddhism traveled from India to China. Papermaking and gunpowder reached Europe from China. The Silk Road flourished for centuries, facilitating cultural exchange between diverse civilizations. It declined with the rise of maritime trade routes but left a lasting legacy of interconnectedness."
    },

    // Technology (21-30)
    {
        id: 21,
        category: "technology",
        text: "The internet has revolutionized how we communicate, work, and access information. What began as a small network of computers in the nineteen sixties has grown into a global system connecting billions of devices. Today, we can instantly share information with anyone anywhere in the world. The World Wide Web, invented by Tim Berners-Lee, made the internet accessible to everyone. Social media platforms connect people across continents. E-commerce has transformed shopping. Cloud computing allows us to store data remotely. The internet continues to evolve with new technologies like the Internet of Things and artificial intelligence."
    },
    {
        id: 22,
        category: "technology",
        text: "Artificial intelligence and machine learning are shaping the future, with applications in healthcare, transportation, and entertainment. AI systems can recognize faces, understand speech, and make predictions. Machine learning algorithms improve with experience, getting better over time. Self-driving cars use AI to navigate roads safely. Virtual assistants like Siri and Alexa help with daily tasks. AI can diagnose diseases from medical images more accurately than humans in some cases. However, AI also raises ethical concerns about privacy, job displacement, and decision-making. Researchers are working to ensure AI benefits humanity."
    },
    {
        id: 23,
        category: "technology",
        text: "Smartphones have become essential tools in modern life. These powerful computers fit in our pockets and connect us to the world. The first iPhone was introduced in two thousand seven, revolutionizing the mobile phone industry. Today's smartphones have powerful processors, high-resolution cameras, and bright displays. They run millions of apps for communication, entertainment, productivity, and more. Mobile payment systems allow us to pay with our phones. Navigation apps guide us to our destinations. Smartphones have changed how we interact, work, and access information, making them indispensable for many people."
    },
    {
        id: 24,
        category: "technology",
        text: "Space exploration has expanded our understanding of the universe. The first satellite, Sputnik, launched in nineteen fifty-seven. Yuri Gagarin became the first human in space in nineteen sixty-one. Neil Armstrong walked on the moon in nineteen sixty-nine. Robotic probes have explored all the planets in our solar system. The Hubble Space Telescope has captured stunning images of distant galaxies. The International Space Station has hosted astronauts from many countries for over twenty years. Private companies like SpaceX are now developing new spacecraft. Future missions aim to return humans to the moon and eventually reach Mars."
    },
    {
        id: 25,
        category: "technology",
        text: "The printing press, invented by Johannes Gutenberg around fourteen fifty, was one of the most important inventions in history. It made books affordable and accessible, spreading knowledge throughout Europe. Before the printing press, books were copied by hand, making them rare and expensive. The ability to mass-produce text revolutionized education, religion, and science. The Bible was printed in vernacular languages, allowing people to read it for themselves. Scientific ideas spread more quickly. The printing press laid the foundation for the Renaissance, the Reformation, and the Scientific Revolution."
    },
    {
        id: 26,
        category: "technology",
        text: "Robotics is transforming manufacturing, healthcare, and many other fields. Industrial robots assemble cars with precision and speed. Surgical robots help doctors perform delicate procedures. Robots explore dangerous environments like deep oceans and other planets. In warehouses, robots sort and move packages efficiently. Some robots vacuum our floors and mow our lawns. Advanced robots can walk, run, and even perform backflips. As robots become more capable and affordable, they will take on more tasks. This raises questions about how work will change and how society will adapt."
    },
    {
        id: 27,
        category: "technology",
        text: "The development of computers has been one of the most significant technological advances. Early computers filled entire rooms and had less power than today's calculators. The invention of the microprocessor in nineteen seventy-one made personal computers possible. Companies like Apple and Microsoft brought computers into homes and offices. Moore's Law predicted that computer power would double every two years, and this held true for decades. Today's computers are thousands of times more powerful than those from the nineteen eighties. They have transformed every aspect of modern life, from work to entertainment to communication."
    },
    {
        id: 28,
        category: "technology",
        text: "Electric vehicles are becoming more common as technology improves and environmental concerns grow. Early electric cars appeared in the nineteenth century but were overshadowed by gasoline vehicles. Modern electric vehicles use advanced batteries that can power cars for hundreds of miles. They produce no tailpipe emissions, reducing air pollution. Charging infrastructure is expanding, making electric vehicles more practical. Companies like Tesla have popularized electric cars with impressive performance and range. Many major automakers are now developing electric models. The transition to electric vehicles could significantly reduce greenhouse gas emissions from transportation."
    },
    {
        id: 29,
        category: "technology",
        text: "Medical technology has advanced dramatically, saving countless lives. Imaging technologies like X-rays, CT scans, and MRI allow doctors to see inside the body without surgery. Pacemakers regulate heart rhythms. Prosthetic limbs have become increasingly sophisticated. Robotic surgery enables precise, minimally invasive procedures. Vaccines prevent diseases that once killed millions. Antibiotics treat bacterial infections. Gene editing technologies like CRISPR offer the potential to cure genetic disorders. Telemedicine allows patients to consult doctors remotely. As technology continues to advance, we can expect even more breakthroughs in healthcare."
    },
    {
        id: 30,
        category: "technology",
        text: "Renewable energy technologies are crucial for addressing climate change. Solar panels convert sunlight directly into electricity. Wind turbines generate power from the wind. Hydroelectric dams use flowing water. Geothermal plants tap into heat from underground. These technologies produce electricity without emitting greenhouse gases. The cost of solar and wind power has fallen dramatically, making them competitive with fossil fuels. Energy storage systems like batteries help manage the variability of renewable sources. Many countries are transitioning to clean energy, with some aiming for completely renewable electricity in the coming decades."
    },

    // Literature & Arts (31-40)
    {
        id: 31,
        category: "literature",
        text: "William Shakespeare is widely regarded as the greatest writer in the English language. He wrote about thirty-nine plays, one hundred fifty-four sonnets, and other poems. His works include tragedies like Hamlet and Romeo and Juliet, comedies like A Midsummer Night's Dream, and histories like Henry V. Shakespeare's characters are deeply human, exploring universal themes of love, jealousy, ambition, and betrayal. He invented hundreds of words and phrases still used today. His influence extends beyond literature to theater, film, and popular culture. Four centuries after his death, his works continue to be performed and studied worldwide."
    },
    {
        id: 32,
        category: "literature",
        text: "The history of art spans thousands of years, from ancient cave paintings to modern digital art. The Renaissance period produced masterpieces by Leonardo da Vinci, Michelangelo, and Raphael. Impressionism changed how artists approached light and color. Today, art continues to evolve with new technologies and cultural influences. Art reflects the values, beliefs, and experiences of its time. It can challenge viewers, evoke emotions, or simply bring beauty into the world. Museums preserve and display art for future generations. Whether painting, sculpture, photography, or digital media, art remains an essential part of human expression."
    },
    {
        id: 33,
        category: "literature",
        text: "Music has been part of human culture for at least forty thousand years. Ancient instruments like flutes and drums have been found in archaeological sites. Different cultures developed unique musical traditions, from classical Indian ragas to African drumming, European classical music, and American jazz. Music affects our brains in powerful ways, triggering emotional responses and memories. It can soothe, energize, or inspire us. Today, technology allows anyone to create and share music. Streaming services give us access to millions of songs. Music remains a universal language that connects people across cultures."
    },
    {
        id: 34,
        category: "literature",
        text: "Charles Dickens was one of the most popular English novelists of the nineteenth century. His works include classics like A Christmas Carol, Oliver Twist, and Great Expectations. Dickens wrote about the struggles of the poor and the injustices of Victorian society. His characters are memorable and often humorous. He published many of his novels in serial form, with new chapters appearing regularly in magazines. This kept readers eagerly awaiting each installment. Dickens also gave public readings of his works, drawing large crowds. His books remain widely read and have been adapted into numerous films and plays."
    },
    {
        id: 35,
        category: "literature",
        text: "The ancient Greeks developed theater as an art form. They held festivals where playwrights competed for prizes. Tragedies by Aeschylus, Sophocles, and Euripides explored serious themes like fate, justice, and the relationship between humans and gods. Comedies by Aristophanes satirized politics and society. Greek theaters were large outdoor structures that could hold thousands of spectators. Actors wore masks to portray different characters. The chorus commented on the action and represented the voice of the community. Greek drama has influenced theater for over two thousand years and is still performed today."
    },
    {
        id: 36,
        category: "literature",
        text: "Jane Austen wrote novels that explore the lives of women in early nineteenth-century England. Her works include Pride and Prejudice, Sense and Sensibility, and Emma. Austen's novels are known for their wit, social commentary, and memorable characters. She focused on themes of marriage, money, and social status. Her heroines are intelligent and independent, navigating a society with limited options for women. Austen's books were published anonymously during her lifetime but have since become classics. They have been adapted into numerous films and television series, introducing new generations to her work."
    },
    {
        id: 37,
        category: "literature",
        text: "The invention of photography in the nineteenth century revolutionized visual art. For the first time, people could capture accurate images of the world around them. Early photographs required long exposure times, so subjects had to stay perfectly still. As technology improved, photography became faster and more accessible. Photographers documented history, from wars to everyday life. Photography also became an art form, with photographers exploring composition, light, and subject matter. Today, digital photography allows anyone to take and share photos instantly. Photography continues to evolve, shaping how we see and remember the world."
    },
    {
        id: 38,
        category: "literature",
        text: "Mark Twain, born Samuel Clemens, was an American author and humorist. His most famous works include The Adventures of Tom Sawyer and Adventures of Huckleberry Finn. Twain wrote about life along the Mississippi River, drawing on his own experiences as a riverboat pilot. His writing is known for its humor, vivid characters, and social criticism. Huckleberry Finn, in particular, addresses serious themes of racism and freedom. Twain was also a popular lecturer, traveling around the world to speak. His work has had a lasting impact on American literature and continues to be read and studied."
    },
    {
        id: 39,
        category: "literature",
        text: "The development of film in the late nineteenth century created a new art form. Early films were short, silent, and in black and white. The addition of sound in the nineteen twenties transformed the medium. Color films became common in the nineteen thirties and forties. Different genres emerged, from comedies and dramas to westerns and musicals. Directors like Alfred Hitchcock, Orson Welles, and Akira Kurosawa pushed the boundaries of what film could achieve. Today, films entertain billions of people around the world. They tell stories, explore ideas, and capture the imagination in ways unique to the medium."
    },
    {
        id: 40,
        category: "literature",
        text: "Poetry is one of the oldest forms of literature, dating back to ancient times. Epic poems like Homer's Iliad and Odyssey were composed orally before being written down. Poets use rhythm, rhyme, and imagery to create emotional and intellectual effects. Haiku, a Japanese form, captures moments in just seventeen syllables. Sonnets, popularized by Shakespeare, explore themes of love and time. Free verse poetry breaks traditional rules, allowing poets to experiment. Poetry can be personal, political, or philosophical. It distills complex ideas and feelings into powerful, concentrated language that resonates with readers."
    },

    // General Knowledge (41-50)
    {
        id: 41,
        category: "general",
        text: "The Great Wall of China is one of the most impressive architectural feats in human history. It stretches over thirteen thousand miles across mountains, deserts, and grasslands. Construction began in the seventh century BC and continued for over two thousand years, with various dynasties adding to its length and fortifications. The wall was built to protect Chinese states from invasions. Hundreds of thousands of workers labored on its construction, and many died. Contrary to popular belief, the wall cannot be seen from space with the naked eye. Today, it is a UNESCO World Heritage site and one of the most popular tourist attractions in the world."
    },
    {
        id: 42,
        category: "general",
        text: "The Olympic Games began in ancient Greece over two thousand seven hundred years ago. They were held every four years in Olympia to honor Zeus. Athletes competed in events like running, wrestling, and chariot racing. The games were so important that wars were paused so athletes could travel safely. The modern Olympic Games began in eighteen ninety-six and have grown into a major international event. Athletes from around the world compete every four years in the Summer and Winter Games. The Olympics promote friendship and understanding between nations. The five rings on the Olympic flag represent the five inhabited continents."
    },
    {
        id: 43,
        category: "general",
        text: "The Amazon rainforest is the largest tropical rainforest in the world. It covers much of northwestern Brazil and extends into other South American countries. The Amazon is home to an incredible variety of plants and animals, many found nowhere else on Earth. It produces about twenty percent of the world's oxygen and is often called the lungs of the planet. Indigenous peoples have lived in the Amazon for thousands of years. Deforestation threatens this unique ecosystem, as trees are cleared for farming and ranching. Conservation efforts aim to protect the rainforest and its biodiversity for future generations."
    },
    {
        id: 44,
        category: "general",
        text: "The pyramids of Egypt are among the most famous ancient structures in the world. The largest, the Great Pyramid of Giza, was built as a tomb for Pharaoh Khufu around twenty-five hundred BC. It originally stood about one hundred forty-six meters tall and was covered in smooth white limestone. The pyramid remained the tallest man-made structure for over thirty-eight hundred years. Building the pyramids required enormous resources and organization. Workers quarried, transported, and lifted massive stone blocks. The pyramids reflect the power and wealth of ancient Egyptian civilization. They continue to fascinate visitors and researchers today."
    },
    {
        id: 45,
        category: "general",
        text: "The Eiffel Tower was built for the eighteen eighty-nine World's Fair in Paris. Many Parisians initially disliked the tower, calling it an eyesore. Designed by Gustave Eiffel, it was the tallest man-made structure in the world until the Chrysler Building was completed in nineteen thirty. The tower stands three hundred thirty meters tall and weighs about ten thousand tons. It was almost dismantled in nineteen nine but was saved because its antenna could be used for telegraphy. Today, the Eiffel Tower is one of the most recognizable landmarks in the world and a symbol of France."
    },
    {
        id: 46,
        category: "general",
        text: "The Statue of Liberty was a gift from France to the United States, dedicated in eighteen eighty-six. It stands on Liberty Island in New York Harbor, welcoming visitors arriving by sea. The statue was designed by Frédéric Auguste Bartholdi and built by Gustave Eiffel. It depicts Libertas, the Roman goddess of freedom, holding a torch and a tablet inscribed with the date of American independence. The statue became a symbol of freedom and democracy, especially for immigrants arriving in America. The famous poem on its base, by Emma Lazarus, invites the tired, poor, and huddled masses yearning to breathe free."
    },
    {
        id: 47,
        category: "general",
        text: "The Taj Mahal is a white marble mausoleum in Agra, India, built by Emperor Shah Jahan in memory of his wife Mumtaz Mahal. Construction began in sixteen thirty-two and took about twenty years to complete. The building is considered one of the finest examples of Mughal architecture, blending Persian, Islamic, and Indian styles. The Taj Mahal is famous for its symmetrical design and the way its color appears to change throughout the day. It attracts millions of visitors annually and is recognized as one of the New Seven Wonders of the World. It stands as a monument to love and loss."
    },
    {
        id: 48,
        category: "general",
        text: "The Colosseum in Rome is the largest ancient amphitheater ever built. Construction began under Emperor Vespasian in seventy-two AD and was completed by his son Titus in eighty AD. The arena could hold up to eighty thousand spectators who came to watch gladiator contests, animal hunts, and other spectacles. The Colosseum had a complex system of underground tunnels and rooms where animals and performers were kept. It was used for nearly five hundred years before being abandoned. Earthquakes and stone robbers damaged the structure over time. Today, it is a major tourist attraction and a symbol of ancient Rome."
    },
    {
        id: 49,
        category: "general",
        text: "The Sphinx is a massive limestone statue with the body of a lion and the head of a human. It stands on the Giza Plateau near Cairo, Egypt, close to the Great Pyramids. The statue is believed to represent Pharaoh Khafre, who ruled around twenty-five hundred BC. It is about seventy-three meters long and twenty meters tall, making it one of the largest monolith statues in the world. The Sphinx has suffered damage over the millennia, including a missing nose. Various restoration projects have attempted to preserve it. The Sphinx remains an enduring mystery, inspiring legends and speculation."
    },
    {
        id: 50,
        category: "general",
        text: "The Leaning Tower of Pisa is the bell tower of the cathedral in Pisa, Italy. Construction began in eleven seventy-three and took about two hundred years to complete. The tower began to lean during construction because the ground was unstable. Efforts to correct the tilt over the centuries have only partially succeeded. The tower stands about fifty-six meters tall on the high side and has two hundred ninety-six steps. Galileo supposedly conducted experiments on gravity by dropping objects from the tower. The Leaning Tower is one of Italy's most famous landmarks, attracting millions of tourists who come to see its distinctive tilt."
    }
];

// ✅ Make available globally
window.TEXT_SAMPLES = TEXT_SAMPLES;

// For Node.js environment (optional)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TEXT_SAMPLES;
}