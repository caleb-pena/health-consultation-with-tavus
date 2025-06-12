import React, { useEffect, useRef, useState } from 'react';
import DailyIframe from '@daily-co/daily-js';
import './App.css';

function App() {
  const videoFrameRef = useRef(null);
  const [callFrame, setCallFrame] = useState(null);
  const [status, setStatus] = useState('');
  const callFrameRef = useRef(null); // Additional ref to ensure we have the latest callFrame

  const API_KEY = process.env.REACT_APP_TAVUS_API_KEY;

  const cureFor = {
    "cold": "Paracetamol",
    "flu": "Oseltamivir",
    "asthma": "Salbutamol",
    "migraine": "Sumatriptan",
    "depression": "Fluoxetine",
    "epilepsy": "Sodium Valproate"
  };

  const createGeneralPersona = async () => {
    const requestBody = {
      "persona_name": "Personal Doctor",
      "pipeline_mode": "full",
      "system_prompt": "You are a friendly Personal Doctor who know cures to all the disease in the world. In this call, users want to know what are the cures to the user's disease",
      "context": "User want to know what is the cure to his/her disease. When a user says \"What is the cure to X\", you should acknowledge their disease and use the get_cures tool to return the cures of the disease's cures based on user request",
      "layers": {
        "tts": {
          "tts_engine": "cartesia",
          "tts_emotion_control": true,
        },
        "llm": {
          "tools": [
            {
              "type": "function",
              "function": {
                "name": "get_cures",
                "parameters": {
                  "type": "object",
                  "required": ["disease"],
                  "properties": {
                    "disease": {
                      "type": "string",
                      "description": "The disease which the user wanted to know how to cure"
                    }
                  }
                },
                "description": "Record the user's disease"
              }
            }
          ],
          "model": "tavus-llama",
          "speculative_inference": true
        },
        "stt": {
          "stt_engine": "tavus-advanced",
          "participant_pause_sensitivity": "high",
          "participant_interrupt_sensitivity": "high",
          "smart_turn_detection": true,
        }
      }
    };

    const options = {
      method: 'POST',
      headers: {
        'x-api-key': API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    };

    try {
      const response = await fetch('https://tavusapi.com/v2/personas', options);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
      }

      const contentType = response.headers.get('content-type');
      
      if (!contentType || !contentType.includes('application/json')) {
        const responseText = await response.text();
        throw new Error(`Expected JSON response but got: ${contentType}. Response: ${responseText.substring(0, 200)}...`);
      }

      const data = await response.json();
      return data;
    } catch (err) {
      console.error('Error creating persona:', err);
      throw err;
    }
  };

  const createSkinPersona = async () => {
    const requestBody = {
      "persona_name": "Personal Skin Doctor",
      "pipeline_mode": "full",
      "system_prompt": "You are a friendly Personal Skin Doctor who know cures to all the disease in the world. In this call, users want to know what are the cures to the user's disease",
      "context": "User want to know what is the cure to his/her disease. When a user says \"What is the cure to X\", you should acknowledge their disease and use the get_cures tool to return the cures of the disease's cures based on user request",
      "layers": {
        "tts": {
          "tts_engine": "cartesia",
          "tts_emotion_control": true,
        },
        "llm": {
          "tools": [
            {
              "type": "function",
              "function": {
                "name": "get_cures",
                "parameters": {
                  "type": "object",
                  "required": ["disease"],
                  "properties": {
                    "disease": {
                      "type": "string",
                      "description": "The disease which the user wanted to know how to cure"
                    }
                  }
                },
                "description": "Record the user's disease"
              }
            }
          ],
          "model": "tavus-llama",
          "speculative_inference": true
        },
        "perception": {
          "perception_model": "raven-0",
          "ambient_awareness_queries": [
            "Is the user have an acne in his or her face?",
            "Does the user appear distressed or uncomfortable?"
          ],
          "perception_tool_prompt": "You have a tool to notify the system when an acne is detected on user face, named `acne_detected`. You MUST use this tool when an acne is detected on user face.",
          "perception_tools": [
            {
              "type": "function",
              "function": {
                "name": "acne_detected",
                "description": "Use this function when acne is detected in the image with high confidence",
                "parameters": {
                  "type": "object",
                  "properties": {
                    "have_acne": {
                      "type": "boolean",
                      "description": "is acne detected on user's face?"
                    }
                  },
                  "required": [
                    "have_acne"
                  ]
                }
              }
            }
          ]
        },
        "stt": {
          "stt_engine": "tavus-advanced",
          "participant_pause_sensitivity": "high",
          "participant_interrupt_sensitivity": "high",
          "smart_turn_detection": true,
        }
      }
    };

    const options = {
      method: 'POST',
      headers: {
        'x-api-key': API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    };

    try {
      const response = await fetch('https://tavusapi.com/v2/personas', options);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
      }

      const contentType = response.headers.get('content-type');
      
      if (!contentType || !contentType.includes('application/json')) {
        const responseText = await response.text();
        throw new Error(`Expected JSON response but got: ${contentType}. Response: ${responseText.substring(0, 200)}...`);
      }

      const data = await response.json();
      return data;
    } catch (err) {
      console.error('Error creating persona:', err);
      throw err;
    }
  };

  const createCall = async (selection) => {
    try {
      var persona
      if(selection === "general"){
        persona = await createGeneralPersona();
      } else {
        persona = await createSkinPersona();
      }
      
      const personaId = persona.persona_id;

      const callRequestBody = {
        "replica_id": "r6583a465c",
        "persona_id": personaId
      };

      const options = {
        method: 'POST',
        headers: {
          'x-api-key': API_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(callRequestBody)
      };

      const response = await fetch('https://tavusapi.com/v2/conversations', options);
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
      }

      const data = await response.json();
      return data;
    } catch (err) {
      console.error('Error creating call:', err);
      throw err;
    }
  };

  const handleAppMessage = async (event) => {
    console.log('Received app message event:', event);
    
    const message = event.data;
    console.log('Message data:', message);
    
    if (!message || !message.message_type || !message.event_type) {
      console.log('Invalid message structure:', message);
      return;
    }
    
    if (message.message_type === 'conversation' && message.event_type === 'conversation.utterance' && 
      message.properties?.role === 'user') {
      console.log('User said:', message.properties.speech);
    }
    
    if (message.message_type === 'conversation' && message.event_type === 'conversation.tool_call') {
      const toolCall = message.properties;
      console.log('Tool call:', toolCall);
      
      if (!toolCall) {
        console.log('No tool call found in message properties');
        return;
      }
      
      if (toolCall.name === 'get_cures') {
        try {
          const args = JSON.parse(toolCall.arguments);
          const disease = args.disease;
          console.log('User wanted to know cures for', disease);
          
          const diseaseclear = disease.trim().toLowerCase();
          const cure = cureFor[diseaseclear];
          
          const responseMessage = {
            message_type: "conversation",
            event_type: "conversation.echo",
            conversation_id: message.conversation_id,
            properties: {
              text: `The cure for ${disease} is ${cure}.`
            }
          };

          console.log('Sending echo message:', responseMessage);
          
          // Check if callFrame exists before trying to send message
          const currentCallFrame = callFrameRef.current || callFrame;
          if (currentCallFrame && typeof currentCallFrame.sendAppMessage === 'function') {
            currentCallFrame.sendAppMessage(responseMessage, '*');
            console.log('Message sent successfully');
          } else {
            console.error('CallFrame is not available or sendAppMessage method is missing');
            console.log('CallFrame ref:', callFrameRef.current);
            console.log('CallFrame state:', callFrame);
          }
        } catch (error) {
          console.error('Error in processing cure request:', error);
        }
      }

      if (toolCall.name === 'acne_detected') {
        try {
          console.log('Acne detected:');
          
          const responseMessage = {
            message_type: "conversation",
            event_type: "conversation.echo",
            conversation_id: message.conversation_id,
            properties: {
              text: `I Notice that you have an acne on your face, I suggest to use Topical antibiotics like clindamycin and erythromycin.`
            }
          };

          console.log('Sending echo message:', responseMessage);
          
          // Check if callFrame exists before trying to send message
          const currentCallFrame = callFrameRef.current || callFrame;
          if (currentCallFrame && typeof currentCallFrame.sendAppMessage === 'function') {
            currentCallFrame.sendAppMessage(responseMessage, '*');
            console.log('Message sent successfully');
          } else {
            console.error('CallFrame is not available or sendAppMessage method is missing');
            console.log('CallFrame ref:', callFrameRef.current);
            console.log('CallFrame state:', callFrame);
          }
        } catch (error) {
          console.error('Error in processing cure request:', error);
        }
      }
    }
  };

  const joinConversation = (selection) => {
    setStatus('Creating call...');
    
    createCall(selection).then(response => {
      const conversationURL = response.conversation_url;

      if (!conversationURL) {
        alert(response.message);
        setStatus('Failed to get conversation URL');
        return;
      }

      // Clean up previous call frame
      if (callFrameRef.current) {
        try {
          callFrameRef.current.leave();
        } catch (e) {
          console.log('Error leaving previous call:', e);
        }
        callFrameRef.current = null;
      }

      if (callFrame) {
        try {
          callFrame.leave();
        } catch (e) {
          console.log('Error leaving previous call frame:', e);
        }
      }

      if (videoFrameRef.current) {
        videoFrameRef.current.innerHTML = "";
      }

      setStatus('Initializing call frame...');

      // Initialize the call frame
      const newCallFrame = DailyIframe.createFrame(videoFrameRef.current, {
        showLeaveButton: true,
      });
      
      // Store reference immediately
      callFrameRef.current = newCallFrame;
      setCallFrame(newCallFrame);
      
      // Add event listener
      newCallFrame.on('app-message', handleAppMessage);
      
      // Add other useful event listeners for debugging
      newCallFrame.on('joined-meeting', () => {
        console.log('Successfully joined meeting');
        setStatus('Connected successfully!');
      });
      
      newCallFrame.on('left-meeting', () => {
        console.log('Left meeting');
        setStatus('Disconnected');
        callFrameRef.current = null;
        setCallFrame(null);
      });
      
      newCallFrame.on('error', (error) => {
        console.error('Call frame error:', error);
        setStatus('Connection error');
      });

      setStatus('Joining conversation...');

      // Join the conversation
      newCallFrame.join({ url: conversationURL, userName: "You" }).then(() => {
        console.log("Joined Conversation successfully!");
        setStatus("Connected successfully!");
      }).catch((error) => {
        console.error("Failed to join conversation:", error);
        alert("Failed to join Conversation: " + error.message);
        setStatus("Failed to connect");
        // Clean up on error
        callFrameRef.current = null;
        setCallFrame(null);
      });
      
    }).catch(error => {
      console.error("Failed to create call:", error);
      alert("Failed to create call: " + error.message);
      setStatus("Failed to create call");
    });
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (callFrameRef.current) {
        try {
          callFrameRef.current.leave();
        } catch (e) {
          console.log('Cleanup error:', e);
        }
      }
    };
  }, []);

  return (
    <div className="App">
      <div className="top">
        <img src={require("./logo-tavus.png")} alt="background" className="background-image" />
        <h1>Online Doctor</h1>
        <p>Consult your health problem with our AI doctor! Powered with Tavus.</p>
        <div className="button-container">
          <button className="button" onClick={() => joinConversation("general")}>General Doctor</button>
          <button className="button" onClick={() => joinConversation("skin")}>Skin Doctor</button>
        </div>
      </div>

      <div className="frosted-wrapper">
        <div className="frosted-glass"></div>
        <div ref={videoFrameRef} id="video-frame"></div>
      </div>

      <div id="status">{status}</div>
    </div>
  );
}

export default App;