from .models import OpenAIAssistant
from OpenAIService.openai_service import OpenAIService
import logging

class OpenAIAssistantRepository():
    @staticmethod
    def get_assistant(name):
        """Created a fixture, from where we will store details about the assistant in DB.
            In this function just checking if id of assistant exists or not. If it doesn't
            exists create new id and store it for that assistant
        """
        try:
            assistant_from_db = OpenAIAssistant.objects.get(name=name)
            
            if assistant_from_db.assistant_id == '':
                new_assistant = OpenAIService().create_assistant(
                    name=assistant_from_db.name,
                    instructions=assistant_from_db.instructions,
                    tools=assistant_from_db.tools,
                    model=assistant_from_db.open_ai_model
                )
                
                assistant_from_db.assistant_id = new_assistant.id
                assistant_from_db.save()
            
                return new_assistant
            else: 
                new_assistant=OpenAIService().get_assistant(id=assistant_from_db.assistant_id)
                return new_assistant
        
        
        except OpenAIAssistant.DoesNotExist:
            logging.error(f"Assistant not found for name: {name}")
            return None


