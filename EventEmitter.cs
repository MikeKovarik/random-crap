using System;
using System.Collections.Generic;


namespace EventEmitter {


    public class EventEmitter {

        private Dictionary<string, List<Action<object>>> _events = new Dictionary<string, List<Action<object>>>();
        private Dictionary<Action, Action<object>> argumentlessWrappers = new Dictionary<Action, Action<object>>();

        public void On(string eventName, Action cb) {
            Action<object> wrappedCb = (object data) => { cb(); };
            On(eventName, wrappedCb);
            argumentlessWrappers.Add(cb, wrappedCb);
        }
        public void On(string eventName, Action<object> cb) {
            if (!_events.TryGetValue(eventName, out List<Action<object>> callbacks)) {
                callbacks = new List<Action<object>> { };
                _events.Add(eventName, callbacks);
            }
            callbacks.Add(cb);
        }

        public void RemoveListener(string eventName, Action cb) {
            if (argumentlessWrappers.TryGetValue(cb, out Action<object> wrappedCb)) {
                RemoveListener(eventName, wrappedCb);
            }
        }
        public void RemoveListener(string eventName, Action<object> cb) {
            if (_events.TryGetValue(eventName, out List<Action<object>> callbacks)) {
                var _event = callbacks.Exists(e => e == cb);
                if (_event) {
                    callbacks.Remove(cb);
                }
            }
        }

        public void Emit(string eventName, object data = null) {
            if (_events.TryGetValue(eventName, out List<Action<object>> callbacks)) {
                foreach (var cb in callbacks) {
                    cb(data);
                }
            }
        }

        public void RemoveAllListeners(string eventName) {
            if (_events.TryGetValue(eventName, out List<Action<object>> callbacks)) {
                callbacks.RemoveAll(x => x != null);
            }
            // TODO: remove wrappers as well. Leaks memory.
        }


    }


}
