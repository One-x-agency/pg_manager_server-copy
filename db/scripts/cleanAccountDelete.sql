

with account_to_be_delete (
    select * from account where
    isDeleted = true
)
