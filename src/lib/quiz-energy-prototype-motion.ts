// Throwaway study only. Shared foundation tokens own all choreography values.
export const motionTokens = {
 duration:{instant:.08,fast:.18,normal:.35,slow:.6,crawl:1,answerHold:1.05},
 easing:{smooth:[.22,1,.36,1] as const,gsapSmooth:'power2.inOut',gsapBounce:'back.out(1.4)'},
 distance:{small:4,ribbon:40,reveal:16,exit:380,threshold:80,flick:32,velocity:550},
 scale:{press:.97,pop:1.025,sceneStart:.94,scenePulse:.8},
 angle:{drag:14},opacity:{text:.5,scene:.4},
};
export const springs={snappy:{type:'spring' as const,stiffness:300,damping:30},release:{type:'spring' as const,stiffness:200,damping:20}};
