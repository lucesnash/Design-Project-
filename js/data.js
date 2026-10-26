'use strict';
/* ---------- data ---------- */
const EMO={
  cheerful:{label:'Cheerful',pat:[80,60,80],hint:'Higher pitch, lively energy'},
  calm:{label:'Calm',pat:[400],hint:'Steady pitch, low energy'},
  concerned:{label:'Concerned',pat:[220,140,220],hint:'Lower pitch, hesitant'},
  urgent:{label:'Urgent',pat:[70,50,70,50,70,50,70],hint:'High pitch, high energy'},
  sad:{label:'Sad',pat:[500,200,260],hint:'Low pitch, slow'}
};
const PARTNER_LINES=[
  {text:'Good afternoon! How can I help you today?',emo:'cheerful',hz:214},
  {text:'Of course, one moment. Would you like it cold?',emo:'calm',hz:176},
  {text:"I'm sorry, we're out of cold water. Is room temperature fine?",emo:'concerned',hz:162},
  {text:'Please step back, the floor is wet!',emo:'urgent',hz:238},
  {text:"I'm sorry to hear that. Take your time.",emo:'sad',hz:148}
];
const SIGNER_MSGS=[
  {signs:['Hello','Water','Please'],text:'Hello. Water, please.'},
  {signs:['Yes','Thank you'],text:'Yes. Thank you.'},
  {signs:['Yes','Please'],text:'Yes, please.'},
  {signs:['No','Help'],text:'No. I need help.'}
];
const DEMO=[['p',0],['s',0],['p',1],['s',1],['p',2],['s',2]];
const VOC=['Hello','Thank you','Please','Yes','No','My name is','Help','Water','Family','Goodbye'];
const pat10=w=>{let h=0;for(const c of w)h=(h*31+c.charCodeAt(0))>>>0;return Array.from({length:10},(_,i)=>12+((h>>>(i*3))&7)*11+(i%3)*2)};
