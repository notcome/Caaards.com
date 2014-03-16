--[[
name: word_add
keys: %wordset%, %word_key%, %star_key%, %quizset%, %interval_list%
argv: %notes%, %now_time%, %coefficient%
]]--

if redis.call('SISMEMBER', %wordset%, %word_key%) == 1 then
  return false
end

redis.call('SADD', %wordset%, %word_key%)
redis.call('SET', %word_key%, %notes%)
redis.call('INCR', %star_key%)

%quiz_update%({%quizset%, %word_key%, %star_key%, %interval_list%},
              {%now_time%, %coefficient%})

return true
